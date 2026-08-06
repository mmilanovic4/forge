import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { ChangePassword } from "./card-change-password";
import { Passkeys } from "./card-passkeys";
import { TwoFactor } from "./card-two-factor";

export async function Security() {
  const hdrs = await headers();

  const [session, passkeys] = await Promise.all([
    auth.api.getSession({ headers: hdrs }),
    auth.api.listPasskeys({ headers: hdrs }),
  ]);

  return (
    <div className="grid grid-cols-2 items-start gap-6">
      <ChangePassword />
      <TwoFactor initialEnabled={!!session.user.twoFactorEnabled} />
      <Passkeys passkeys={passkeys ?? []} />
    </div>
  );
}
