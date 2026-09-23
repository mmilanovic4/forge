import { activeProviders, emailEnabled } from "@/lib/auth-config";
import { safeRedirect } from "@/lib/utils";

import { LoginClient } from "./login-client";

export const metadata = {
  title: "Login",
};

export default async function Login({ searchParams }) {
  const { email, redirect } = await searchParams;

  return (
    <LoginClient
      email={typeof email === "string" ? email : ""}
      redirectTo={safeRedirect(redirect)}
      emailEnabled={emailEnabled}
      providers={activeProviders.map(({ id, label }) => ({ id, label }))}
    />
  );
}
