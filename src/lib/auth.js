import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import { twoFactor } from "better-auth/plugins/two-factor";

import { cookiePrefix } from "./app-config";
import { activeProviders, emailEnabled } from "./auth-config";
import { db } from "./db";
import { transporter } from "./email";
import {
  loginCodeEmailTpl,
  magicLinkEmailTpl,
  resetPasswordEmailTpl,
  verifyEmailTpl,
} from "./email-templates";

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
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
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
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: "Your login link",
          html: magicLinkEmailTpl({ url }),
        });
      },
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
  databaseHooks: {
    user: {
      update: {
        // `name` is derived, never editable in the UI, so keep it in sync
        // whenever firstName/lastName move. Every user write in the app goes
        // through better-auth (profile form, admin plugin, OAuth), so this is
        // the one place that sees them all.
        before: (data, context) => {
          console.log({ data, context });
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
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: emailEnabled,
    sendResetPassword: emailEnabled
      ? async ({ user, url }) => {
          await transporter.sendMail({
            from: process.env.SMTP_FROM,
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
          await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: "Verify your email",
            html: verifyEmailTpl({ firstName: greetingName(user), url }),
          });
        },
      }
    : undefined,
  socialProviders,
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
