import { safeRedirect } from "@/lib/utils";

import { VerifyTwoFactorClient } from "./verify-2fa-client";

export const metadata = {
  title: "Verify 2FA",
};

export default async function VerifyTwoFactor({ searchParams }) {
  const { redirect } = await searchParams;
  return <VerifyTwoFactorClient redirectTo={safeRedirect(redirect)} />;
}
