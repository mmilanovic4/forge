"use client";

import Link from "next/link";

import { ResendButton } from "@/components/resend-button";
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

export function VerifyEmailClient({ email, redirectTo, resent }) {
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
          <ResendButton
            className="w-full"
            successMessage="Verification email sent."
            onResend={() =>
              authClient.sendVerificationEmail({
                email,
                callbackURL: redirectTo,
              })
            }
          />
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href={loginHref}>Back to login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
