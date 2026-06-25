"use client";

import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  emailOTPClient,
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authMethod = process.env.NEXT_PUBLIC_AUTH_METHOD;

const conditionalClientPlugins = [];

if (authMethod === "otp") {
  conditionalClientPlugins.push(emailOTPClient());
} else if (authMethod === "magic-link") {
  conditionalClientPlugins.push(magicLinkClient());
}

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    twoFactorClient({
      twoFactorPage: "/verify-2fa",
    }),
    passkeyClient(),
    ...conditionalClientPlugins,
  ],
});
