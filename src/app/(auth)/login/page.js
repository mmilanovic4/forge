import { activeProviders, emailEnabled } from "@/lib/auth-config";

import { LoginClient } from "./login-client";

export const metadata = {
  title: "Login",
};

export default function Login() {
  return (
    <LoginClient
      emailEnabled={emailEnabled}
      providers={activeProviders.map(({ id, label }) => ({ id, label }))}
    />
  );
}
