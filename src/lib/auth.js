import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, twoFactor } from "better-auth/plugins";

import { db } from "./db";
import { transporter } from "./email";

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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
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
    },
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  emailVerification: {
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
  },
  socialProviders: {
    // Discord
    ...(process.env.DISCORD_CLIENT_ID &&
      process.env.DISCORD_CLIENT_SECRET && {
        discord: {
          clientId: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
        },
      }),
    // GitHub
    ...(process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET && {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }),
    // Google
    ...(process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
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
  ],
});
