"use client";

import Link from "next/link";
import { useState } from "react";

import { CheckCircle2, CircleAlert, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

function ChecklistRow({ ok, label, detail, action }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-3">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
        ) : (
          <CircleAlert className="text-muted-foreground h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {detail && (
            <p className="text-muted-foreground truncate text-xs">{detail}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function SecurityChecklist({
  email,
  emailEnabled,
  emailVerified,
  twoFactorEnabled,
  hasPassword,
  passkeyCount,
  socialAccounts,
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResendVerification() {
    setSending(true);
    const { error } = await authClient.sendVerificationEmail({ email });
    setSending(false);

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
    toast.success("Verification email sent.");
  }

  const independentMethods =
    (hasPassword ? 1 : 0) +
    (passkeyCount > 0 ? 1 : 0) +
    (socialAccounts.length > 0 ? 1 : 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Account security</CardTitle>
        <CardDescription>
          A quick overview of how your account is protected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {independentMethods < 2 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              You only have one way to sign in. Add a passkey or connect another
              sign-in method so you don&apos;t get locked out.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <ChecklistRow
            ok={hasPassword}
            label="Password"
            detail={hasPassword ? "A password is set" : "No password set"}
            action={
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link href="/settings/security">
                  {hasPassword ? "Change" : "Manage"}
                </Link>
              </Button>
            }
          />

          {emailEnabled && (
            <ChecklistRow
              ok={emailVerified}
              label="Email verified"
              detail={email}
              action={
                emailVerified ? (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-green-500/30 text-green-700 dark:text-green-400"
                  >
                    Verified
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={sending || sent}
                    onClick={handleResendVerification}
                  >
                    {sent ? "Sent" : sending ? "Sending..." : "Resend email"}
                  </Button>
                )
              }
            />
          )}

          <ChecklistRow
            ok={twoFactorEnabled}
            label="Two-factor authentication"
            detail={
              twoFactorEnabled
                ? "Enabled with an authenticator app"
                : "Not enabled"
            }
            action={
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link href="/settings/security">
                  {twoFactorEnabled ? "Manage" : "Enable"}
                </Link>
              </Button>
            }
          />

          <ChecklistRow
            ok={passkeyCount > 0}
            label="Passkeys"
            detail={
              passkeyCount > 0
                ? `${passkeyCount} passkey${passkeyCount === 1 ? "" : "s"} registered`
                : "No passkeys registered"
            }
            action={
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link href="/settings/security">
                  {passkeyCount > 0 ? "Manage" : "Add a passkey"}
                </Link>
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
