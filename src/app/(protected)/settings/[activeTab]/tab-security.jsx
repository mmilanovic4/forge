"use client";

import { ChangePassword } from "./card-change-password";
import { Passkeys } from "./card-passkeys";
import { TwoFactor } from "./card-two-factor";

export function Security() {
  return (
    <div className="grid grid-cols-2 items-start gap-6">
      <ChangePassword />
      <TwoFactor />
      <Passkeys />
    </div>
  );
}
