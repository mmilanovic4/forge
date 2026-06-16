import { Suspense } from "react";

import { AuthErrorClient } from "./auth-error-client";

export const metadata = {
  title: "Auth error",
};

export default function AuthError() {
  return (
    <Suspense>
      <AuthErrorClient />
    </Suspense>
  );
}
