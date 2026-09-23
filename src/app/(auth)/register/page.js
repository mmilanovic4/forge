import { activeProviders } from "@/lib/auth-config";
import { safeRedirect } from "@/lib/utils";

import { RegisterClient } from "./register-client";

export const metadata = {
  title: "Register",
};

export default async function Register({ searchParams }) {
  const { email, redirect } = await searchParams;

  return (
    <RegisterClient
      email={typeof email === "string" ? email : ""}
      redirectTo={safeRedirect(redirect)}
      providers={activeProviders.map(({ id, label }) => ({ id, label }))}
    />
  );
}
