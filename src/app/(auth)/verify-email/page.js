import { safeRedirect } from "@/lib/utils";

import { VerifyEmailClient } from "./verify-email";

export const metadata = {
  title: "Verify email",
};

export default async function VerifyEmail({ searchParams }) {
  const { email, redirect, resent } = await searchParams;

  return (
    <VerifyEmailClient
      email={typeof email === "string" ? email : ""}
      redirectTo={safeRedirect(redirect)}
      resent={resent === "1"}
    />
  );
}
