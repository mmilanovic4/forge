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

import { authMethod, organizationsEnabled } from "./app-config";

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
    // No twoFactorPage: the plugin would send the browser there with a bare
    // URL, dropping `?redirect=`. The login page navigates itself instead.
    twoFactorClient(),
    passkeyClient(),
    ...conditionalClientPlugins,
  ],
});
