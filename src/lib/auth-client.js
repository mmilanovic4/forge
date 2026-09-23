"use client";

import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  emailOTPClient,
  magicLinkClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { organizationsEnabled } from "./app-config";

const authMethod = process.env.NEXT_PUBLIC_AUTH_METHOD;

const conditionalClientPlugins = [];

if (authMethod === "otp") {
  conditionalClientPlugins.push(emailOTPClient());
} else if (authMethod === "magic-link") {
  conditionalClientPlugins.push(magicLinkClient());
}

if (organizationsEnabled) {
  conditionalClientPlugins.push(organizationClient());
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
