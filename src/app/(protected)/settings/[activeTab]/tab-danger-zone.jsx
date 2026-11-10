import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { emailEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/session";

import { DeleteAccountCard } from "./delete-account-card";

// A session alone doesn't delete the account; what confirms it depends on what
// this deployment and this account have. The server enforces the same — see
// `deleteUser` and the /delete-user check in lib/auth.js.
export async function DangerZone() {
  const [session, accounts] = await Promise.all([
    getSession(),
    // Only the fallback below needs to know about a password.
    emailEnabled ? [] : auth.api.listUserAccounts({ headers: await headers() }),
  ]);

  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  );

  // "email": a link is sent, and opening it deletes the account.
  // "password": no email to send, so the password is asked for again.
  // "session": neither exists (social or passkey only); better-auth then
  //   insists on a session less than a day old.
  const confirmBy = emailEnabled
    ? "email"
    : hasPassword
      ? "password"
      : "session";

  return <DeleteAccountCard confirmBy={confirmBy} email={session.user.email} />;
}
