import { Suspense } from "react";

import { ResetPasswordClient } from "./reset-password-client";

export const metadata = {
  title: "Reset password",
};

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}
