import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, emailOTP, magicLink, twoFactor } from "better-auth/plugins";

import { activeProviders, emailEnabled } from "./auth-config";
import { db } from "./db";
import { transporter } from "./email";
import {
  loginCodeEmailTpl,
  magicLinkEmailTpl,
  resetPasswordEmailTpl,
  verifyEmailTpl,
} from "./email-templates";

const socialProviders = Object.fromEntries(
  activeProviders.map(({ id, clientId, clientSecret, mapProfileToUser }) => [
    id,
    { clientId, clientSecret, mapProfileToUser },
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
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
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
              firstName: user.firstName,
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
            html: verifyEmailTpl({ firstName: user.firstName, url }),
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
    ...conditionalPlugins,
  ],
});
