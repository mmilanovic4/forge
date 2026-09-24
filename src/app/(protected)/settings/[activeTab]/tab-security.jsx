import { headers } from "next/headers";

import { passwordLogin } from "@/lib/app-config";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";

import { ChangePassword, SetPassword } from "./card-change-password";
import { Passkeys } from "./card-passkeys";
import { TwoFactor } from "./card-two-factor";

export async function Security() {
  const hdrs = await headers();

  const [session, passkeys, accounts] = await Promise.all([
    getSession(),
    auth.api.listPasskeys({ headers: hdrs }),
    auth.api.listUserAccounts({ headers: hdrs }),
  ]);

  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  );
  const twoFactorEnabled = !!session.user.twoFactorEnabled;

  return (
    <div className="grid grid-cols-2 items-start gap-6">
      {passwordLogin && (hasPassword ? <ChangePassword /> : <SetPassword />)}
      {/* Two-factor only guards password sign-in, so it has no place in code
          and link modes — except to let someone who already has it turn it
          off. */}
      {(passwordLogin || twoFactorEnabled) && (
        <TwoFactor
          initialEnabled={twoFactorEnabled}
          hasPassword={hasPassword}
        />
      )}
      <Passkeys passkeys={passkeys ?? []} />
    </div>
  );
}
