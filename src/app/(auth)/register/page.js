import { activeProviders } from "@/lib/auth-config";

import { RegisterClient } from "./register-client";

export const metadata = {
  title: "Register",
};

export default function Register() {
  return (
    <RegisterClient
      providers={activeProviders.map(({ id, label }) => ({ id, label }))}
    />
  );
}
