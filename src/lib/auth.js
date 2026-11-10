import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";

import {
  appName,
  authMethod,
  cookiePrefix,
  MIN_PASSWORD_LENGTH,
  organizationsEnabled,
  passwordLogin,
} from "./app-config";
import { activeProviders, emailEnabled } from "./auth-config";
import { db } from "./db";
import { queueEmail } from "./email";
import {
  deleteAccountEmailTpl,
  invitationEmailTpl,
  loginCodeEmailTpl,
  magicLinkEmailTpl,
  resetPasswordEmailTpl,
  verifyEmailTpl,
} from "./email-templates";
import { avatarPrefix, FILES_URL_PREFIX } from "./files";
import { logger } from "./logger";
import {
  assertNoOrphanedOrganizations,
  defaultOrganizationId,
  deleteSoloOrganizations,
} from "./organization";
import { isAdmin } from "./user";

// firstName is optional (GitHub never sends one), so fall back to the first
// word of the name the provider did give us before dropping the greeting.
const greetingName = (user) => user.firstName || user.name?.split(" ")[0];

const socialProviders = Object.fromEntries(
  activeProviders.map(({ id, clientId, clientSecret, mapProfileToUser }) => [
    id,
    { clientId, clientSecret, mapProfileToUser, disableImplicitSignUp: true },
  ]),
);

// Comma-separated IPs or CIDR ranges of the reverse proxies in front of the
// app. Without them only a single-valued X-Forwarded-For is believed; with
// them the chain is walked back to the first address that isn't a proxy.
const trustedProxies = (process.env.TRUSTED_PROXIES ?? "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

// Seconds. The email says "1 hour" — keep the two in step.
const DELETE_ACCOUNT_LINK_TTL = 60 * 60;

const conditionalPlugins = [];

if (!emailEnabled && (authMethod === "otp" || authMethod === "magic-link")) {
  throw new Error(
    `AUTH_METHOD="${authMethod}" requires SMTP (SMTP_HOST + SMTP_FROM) to be configured.`,
  );
}

if (emailEnabled && authMethod === "otp") {
  conditionalPlugins.push(
    emailOTP({
      sendVerificationOTP({ email, otp }) {
        queueEmail({
          to: email,
          subject: "Your login code",
          html: loginCodeEmailTpl({ otp }),
        });
      },
    }),
  );
} else if (emailEnabled && authMethod === "magic-link") {
  conditionalPlugins.push(
    magicLink({
      sendMagicLink({ email, url }) {
        queueEmail({
          to: email,
          subject: "Your login link",
          html: magicLinkEmailTpl({ url }),
        });
      },
    }),
  );
}

if (organizationsEnabled) {
  conditionalPlugins.push(
    organization({
      // Without SMTP nobody can verify an address, so requiring it would make
      // invitations impossible to accept.
      requireEmailVerificationOnInvitation: emailEnabled,
      // Without SMTP the inviter shares the link from the settings page.
      sendInvitationEmail: emailEnabled
        ? ({ id, email, organization, inviter }) => {
            queueEmail({
              to: email,
              subject: `Join ${organization.name} on ${appName}`,
              html: invitationEmailTpl({
                organizationName: organization.name,
                inviterName: inviter.user.name,
                url: new URL(
                  `/accept-invitation/${id}`,
                  process.env.BETTER_AUTH_URL,
                ).toString(),
              }),
            });
          }
        : undefined,
    }),
  );
}

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  advanced: {
    cookiePrefix,
    ipAddress: trustedProxies.length ? { trustedProxies } : undefined,
  },
  // On in production only (better-auth's default). Counters live in the
  // database rather than in memory, so they hold across instances and
  // restarts — the `rateLimit` table in schema.prisma. better-auth already
  // limits sign-in, sign-up and its own email-sending endpoints; these are the
  // ones this app adds that send email too.
  rateLimit: {
    storage: "database",
    customRules: {
      "/delete-user": { window: 60, max: 3 },
      "/organization/invite-member": { window: 60, max: 10 },
    },
  },
  // Route better-auth's own warnings and errors through the app logger so they
  // share its format.
  logger: {
    log: (level, message, ...args) => {
      const [first, ...rest] = args;
      const context =
        first instanceof Error
          ? { err: first, ...(rest.length && { args: rest }) }
          : { ...(args.length && { args }) };
      logger[level](message, { source: "better-auth", ...context });
    },
  },
  databaseHooks: {
    session: organizationsEnabled
      ? {
          create: {
            // Sessions start without an active organization; pick one here so
            // every sign-in method lands in one without a round trip.
            before: async (session) => ({
              data: {
                ...session,
                activeOrganizationId: await defaultOrganizationId(
                  session.userId,
                ),
              },
            }),
          },
        }
      : undefined,
    user: {
      create: {
        // An avatar is only ever one of the user's own uploads (see the
        // /update-user check below), and a new account has none. Sign-up
        // accepts an `image` all the same, so drop it here — the one place
        // every way of creating a user passes through.
        before: (user) => ({ data: { ...user, image: null } }),
      },
      delete: {
        // Only cleanup here — the ownership check has to run earlier, see
        // assertNoOrphanedOrganizations.
        before: organizationsEnabled
          ? (user) => deleteSoloOrganizations(user.id)
          : undefined,
        // Covers self-deletion and the admin plugin's removeUser alike. The
        // storage client is loaded only here, so everything else importing
        // this file — proxy.js included — doesn't pull it in.
        after: async (user) => {
          const { removeAvatarFile } = await import("./upload");
          await removeAvatarFile(user.id, user.image);
        },
      },
      update: {
        // `name` is derived, never editable in the UI, so keep it in sync
        // whenever firstName/lastName move. Every user write in the app goes
        // through better-auth (profile form, admin plugin, OAuth), so this is
        // the one place that sees them all.
        before: (data, context) => {
          if (data.firstName === undefined && data.lastName === undefined)
            return;
          // The hook only receives the changed fields, so fill the other half
          // from the session user when a caller updates just one of them.
          const current = context?.context?.session?.user;
          const firstName = data.firstName ?? current?.firstName;
          const lastName = data.lastName ?? current?.lastName;
          const name = [firstName, lastName].filter(Boolean).join(" ").trim();
          // `name` is non-null in the schema — never blank it out.
          if (!name) return;
          return { data: { ...data, name } };
        },
      },
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
    },
    // Code and link sign-ins create an account for any unknown address, and
    // with an empty name. Only the register page sends one, so requiring it
    // keeps signing in from ever creating an account — the same line
    // `requestSignUp` draws for social sign-in — and a deleted account from
    // quietly coming back on the next login.
    validateUserInfo: ({ user, source }) => {
      const passwordless =
        source.method === "email-otp" || source.method === "magic-link";
      if (source.action === "create-user" && passwordless && !user.name?.trim())
        return {
          // Reuses better-auth's own code, which /auth-error already explains.
          error: "signup_disabled",
          errorDescription:
            "No account found with this email. Please sign up first.",
        };
    },
    deleteUser: {
      enabled: true,
      // A session alone must not be enough to delete the account behind it.
      // With email, the request only sends a link and the account goes when
      // it is opened; without, the /delete-user check below asks for the
      // password instead.
      sendDeleteAccountVerification: emailEnabled
        ? ({ user, url }) => {
            queueEmail({
              to: user.email,
              subject: "Confirm deleting your account",
              html: deleteAccountEmailTpl({
                firstName: greetingName(user),
                url,
              }),
            });
          }
        : undefined,
      deleteTokenExpiresIn: DELETE_ACCOUNT_LINK_TTL,
      beforeDelete: organizationsEnabled
        ? (user) => assertNoOrphanedOrganizations(user.id)
        : undefined,
    },
  },
  emailAndPassword: {
    // Gates only the sign-in and sign-up endpoints, so in code and link modes a
    // password left over from an earlier mode can't log anyone in, while
    // two-factor's password check keeps working for turning it off.
    enabled: passwordLogin,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    requireEmailVerification: emailEnabled,
    // Whoever prompted the reset may be the reason for it — a session they
    // already hold must not outlive the old password.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: emailEnabled
      ? ({ user, url }) => {
          queueEmail({
            to: user.email,
            subject: "Reset your password",
            html: resetPasswordEmailTpl({
              firstName: greetingName(user),
              url,
            }),
          });
        }
      : undefined,
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  emailVerification: emailEnabled
    ? {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: ({ user, url }) => {
          queueEmail({
            to: user.email,
            subject: "Verify your email",
            html: verifyEmailTpl({ firstName: greetingName(user), url }),
          });
        },
      }
    : undefined,
  socialProviders,
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // `image` is shown to other users and decides which stored avatar is
      // theirs, so it may only point at one of the caller's own uploads — not
      // at someone else's file, nor at an outside URL that would learn every
      // viewer's IP.
      if (ctx.path === "/update-user" && ctx.body?.image != null) {
        const session = await getSessionFromCtx(ctx);
        const own = `${FILES_URL_PREFIX}${avatarPrefix(session?.user.id)}/`;
        if (
          typeof ctx.body.image !== "string" ||
          !ctx.body.image.startsWith(own)
        ) {
          throw new APIError("BAD_REQUEST", { message: "Invalid avatar." });
        }
      }

      if (ctx.path === "/delete-user") {
        const session = await getSessionFromCtx(ctx);
        // Signed out: leave the 401 to the endpoint.
        if (session) {
          // The endpoint runs this too, but only once the emailed link is
          // opened — say so now rather than after sending it.
          if (organizationsEnabled) {
            await assertNoOrphanedOrganizations(session.user.id);
          }

          // No email to confirm through, so the password stands in for it.
          // Accounts without one (social, passkey) fall back to better-auth's
          // own rule: the session must be less than a day old.
          if (!emailEnabled && !ctx.body?.password && !ctx.body?.token) {
            const account =
              await ctx.context.internalAdapter.findCredentialAccount(
                session.user.id,
              );
            if (account?.password) {
              throw new APIError("BAD_REQUEST", {
                code: "PASSWORD_REQUIRED",
                message: "Enter your password to delete your account.",
              });
            }
          }
        }
      }

      // The admin plugin's removeUser has no beforeDelete of its own, and it
      // clears the target's sessions before deleting them — so the ownership
      // check runs here, ahead of the endpoint. Only for admins: anyone else
      // is rejected by the endpoint, and must not learn which organizations
      // the target owns from this error.
      if (
        organizationsEnabled &&
        ctx.path === "/admin/remove-user" &&
        ctx.body?.userId
      ) {
        const session = await getSessionFromCtx(ctx);
        if (!isAdmin(session?.user)) return;
        await assertNoOrphanedOrganizations(ctx.body.userId);
      }
    }),
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    twoFactor({
      issuer: "forge",
    }),
    passkey({
      rpName: "forge",
      registration: {
        requireSession: true,
      },
      advanced: {
        // Defaults to "better-auth-passkey", which cookiePrefix would only
        // wrap, not replace.
        webAuthnChallengeCookie: "passkey_challenge",
      },
    }),
    ...conditionalPlugins,
    // Must stay last: forwards Set-Cookie from auth.api.* calls made inside
    // Server Actions, which otherwise silently drop the session cookie.
    nextCookies(),
  ],
});
