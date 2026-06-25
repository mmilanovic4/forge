"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function PasskeySignIn({
  callbackURL = "/dashboard",
  variant = "outline",
  children = "Sign in with a passkey",
  ...props
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    const { error } = await authClient.signIn.passkey();

    if (error) {
      if (error.code !== "AUTH_CANCELLED") {
        toast.error(error.message ?? "Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    router.push(callbackURL);
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleClick}
      disabled={loading}
      {...props}
    >
      <KeyRound />
      {loading ? "Signing in..." : children}
    </Button>
  );
}
