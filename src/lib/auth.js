import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, emailOTP, magicLink, twoFactor } from "better-auth/plugins";

import {
  emailEnabled,
  providerProfileMap,
  socialProviders,
} from "./auth-config";
import { db } from "./db";
import { transporter } from "./email";

const enrichedSocialProviders = Object.fromEntries(
  Object.entries(socialProviders).map(([key, config]) => [
    key,
    providerProfileMap[key]
      ? { ...config, mapProfileToUser: providerProfileMap[key] }
      : config,
  ]),
);

const conditionalPlugins = [];

const authMethod = process.env.NEXT_PUBLIC_AUTH_METHOD;

if (authMethod === "otp") {
  conditionalPlugins.push(
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: "Your login code",
          html: `
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#111;">
  <tr><td style="padding:32px 0 16px;">
    <p style="font-size:20px;font-weight:600;margin:0;">Your login code</p>
  </td></tr>
  <tr><td style="padding:0 0 16px;">
    <p style="font-size:14px;margin:0;color:#555;">Enter the code below to sign in. This code expires in 10 minutes.</p>
  </td></tr>
  <tr><td style="padding:0 0 32px;">
    <p style="font-size:32px;font-weight:700;margin:0;letter-spacing:8px;">${otp}</p>
  </td></tr>
  <tr><td>
    <p style="font-size:12px;color:#999;margin:0;">If you didn't request this code, you can ignore this email.</p>
  </td></tr>
</table>
`,
        });
      },
    }),
  );
} else if (authMethod === "magic-link") {
  conditionalPlugins.push(
    magicLink({
      async sendMagicLink({ email, url }) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: "Your login link",
          html: `
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#111;">
  <tr><td style="padding:32px 0 16px;">
    <p style="font-size:20px;font-weight:600;margin:0;">Your login link</p>
  </td></tr>
  <tr><td style="padding:0 0 16px;">
    <p style="font-size:14px;margin:0;color:#555;">Click the button below to sign in. This link expires in 1 hour.</p>
  </td></tr>
  <tr><td style="padding:0 0 32px;">
    <a href="${url}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">Sign in</a>
  </td></tr>
  <tr><td>
    <p style="font-size:12px;color:#999;margin:0;">If you didn't request this link, you can ignore this email.</p>
  </td></tr>
</table>
`,
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
            html: `
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#111;">
    <tr><td style="padding:32px 0 16px;">
      <p style="font-size:20px;font-weight:600;margin:0;">Reset your password</p>
    </td></tr>
    <tr><td style="padding:0 0 16px;">
      <p style="font-size:14px;margin:0;color:#555;">Hi ${user.firstName}, click the button below to reset your password. This link expires in 1 hour.</p>
    </td></tr>
    <tr><td style="padding:0 0 32px;">
      <a href="${url}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">Reset password</a>
    </td></tr>
    <tr><td>
      <p style="font-size:12px;color:#999;margin:0;">If you didn't request a password reset, you can ignore this email.</p>
    </td></tr>
  </table>
`,
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
            html: `
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#111;">
    <tr><td style="padding:32px 0 16px;">
      <p style="font-size:20px;font-weight:600;margin:0;">Verify your email</p>
    </td></tr>
    <tr><td style="padding:0 0 16px;">
      <p style="font-size:14px;margin:0;color:#555;">Hi ${user.firstName}, click the button below to verify your email address.</p>
    </td></tr>
    <tr><td style="padding:0 0 32px;">
      <a href="${url}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">Verify email</a>
    </td></tr>
    <tr><td>
      <p style="font-size:12px;color:#999;margin:0;">If you didn't create an account, you can ignore this email.</p>
    </td></tr>
  </table>
`,
          });
        },
      }
    : undefined,
  socialProviders: enrichedSocialProviders,
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
