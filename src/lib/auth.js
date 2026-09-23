import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";

import { appName, cookiePrefix, organizationsEnabled } from "./app-config";
import { activeProviders, emailEnabled } from "./auth-config";
import { db } from "./db";
import { sendEmail } from "./email";
import {
  invitationEmailTpl,
  loginCodeEmailTpl,
  magicLinkEmailTpl,
  resetPasswordEmailTpl,
  verifyEmailTpl,
} from "./email-templates";
import { logger } from "./logger";
import {
  assertNoOrphanedOrganizations,
  defaultOrganizationId,
  deleteSoloOrganizations,
} from "./organization";

// firstName is optional (GitHub never sends one), so fall back to the first
// word of the name the provider did give us before dropping the greeting.
const greetingName = (user) => user.firstName || user.name?.split(" ")[0];

const socialProviders = Object.fromEntries(
  activeProviders.map(({ id, clientId, clientSecret, mapProfileToUser }) => [
    id,
    { clientId, clientSecret, mapProfileToUser, disableImplicitSignUp: true },
  ]),
);

const conditionalPlugins = [];

const authMethod = process.env.NEXT_PUBLIC_AUTH_METHOD;

if (!emailEnabled && (authMethod === "otp" || authMethod === "magic-link")) {
  throw new Error(
    `AUTH_METHOD="${authMethod}" requires SMTP (SMTP_HOST + SMTP_FROM) to be configured.`,
  );
}

if (emailEnabled && authMethod === "otp") {
  conditionalPlugins.push(
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await sendEmail({
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
      async sendMagicLink({ email, url }) {
        await sendEmail({
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
        ? async ({ id, email, organization, inviter }) => {
            await sendEmail({
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
            // every sign-in method lands in a workspace without a round trip.
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
      // Only cleanup here — the ownership check has to run earlier, see
      // assertNoOrphanedOrganizations.
      delete: organizationsEnabled
        ? { before: (user) => deleteSoloOrganizations(user.id) }
        : undefined,
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
    deleteUser: {
      enabled: true,
      beforeDelete: organizationsEnabled
        ? (user) => assertNoOrphanedOrganizations(user.id)
        : undefined,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: emailEnabled,
    sendResetPassword: emailEnabled
      ? async ({ user, url }) => {
          await sendEmail({
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
        sendVerificationEmail: async ({ user, url }) => {
          await sendEmail({
            to: user.email,
            subject: "Verify your email",
            html: verifyEmailTpl({ firstName: greetingName(user), url }),
          });
        },
      }
    : undefined,
  socialProviders,
  hooks: {
    // The admin plugin's removeUser has no beforeDelete of its own, and it
    // clears the target's sessions before deleting them — so the ownership
    // check runs here, ahead of the endpoint. Only for admins: anyone else is
    // rejected by the endpoint, and must not learn which organizations the
    // target owns from this error.
    before: organizationsEnabled
      ? createAuthMiddleware(async (ctx) => {
          if (ctx.path !== "/admin/remove-user" || !ctx.body?.userId) return;
          const session = await getSessionFromCtx(ctx);
          if (session?.user.role !== "admin") return;
          await assertNoOrphanedOrganizations(ctx.body.userId);
        })
      : undefined,
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
