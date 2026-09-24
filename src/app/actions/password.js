"use server";

import { headers } from "next/headers";

import { passwordLogin } from "@/lib/app-config";
import { auth } from "@/lib/auth";

// For accounts created without a password (social sign-up): better-auth only
// exposes setPassword on the server, since it needs no current password.
export async function setPasswordAction(newPassword) {
  // In code and link modes a password couldn't be used to sign in anyway.
  if (!passwordLogin) {
    return { error: "Passwords are not used in this app." };
  }

  try {
    await auth.api.setPassword({
      body: { newPassword },
      headers: await headers(),
    });
  } catch (err) {
    return { error: err.message ?? "Something went wrong. Please try again." };
  }

  return { ok: true };
}
