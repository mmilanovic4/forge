"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

// Long enough that an impatient double-click doesn't send two emails, short
// enough that a lost one can be replaced without leaving the page.
const RESEND_COOLDOWN_S = 30;

export function VerifyEmailClient({ email, redirectTo, resent }) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(resent ? RESEND_COOLDOWN_S : 0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    setSending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: redirectTo,
    });
    setSending(false);

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setCooldown(RESEND_COOLDOWN_S);
    toast.success("Verification email sent.");
  }

  const loginHref =
    redirectTo === "/dashboard"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          {email ? (
            <>
              {resent
                ? "Your email isn't verified yet, so we sent a new link to "
                : "We sent a verification link to "}
              <strong>{email}</strong>.
            </>
          ) : (
            "We sent you a verification link. Please check your inbox."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Once verified, you will be automatically signed in. The link expires
          in 1 hour — if it has, or {"didn't"} arrive, check your spam folder or
          send a new one.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {email && (
          <Button
            className="w-full"
            disabled={sending || cooldown > 0}
            onClick={handleResend}
          >
            {sending
              ? "Sending..."
              : cooldown > 0
                ? `Resend email (${cooldown}s)`
                : "Resend email"}
          </Button>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href={loginHref}>Back to login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
