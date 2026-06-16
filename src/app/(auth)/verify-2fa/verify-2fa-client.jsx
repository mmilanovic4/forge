"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@/hooks/use-form";
import { authClient } from "@/lib/auth-client";

export function VerifyTwoFactorClient() {
  const router = useRouter();
  const { values, setValues } = useForm({ code: "" });
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = useBackupCode
      ? await authClient.twoFactor.verifyBackupCode({ code: values.code })
      : await authClient.twoFactor.verifyTotp({ code: values.code });

    if (error) {
      toast.error(error.message ?? "Invalid code. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  function handleCodeChange(e) {
    const value = useBackupCode
      ? e.target.value.trim()
      : e.target.value.replace(/\D/g, "");
    setValues({ ...values, code: value });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>
          {useBackupCode
            ? "Enter one of your backup codes to sign in."
            : "Enter the 6-digit code from your authenticator app."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              {useBackupCode ? "Backup code" : "Verification code"}
            </Label>
            {useBackupCode ? (
              <Input
                autoFocus
                id="code"
                placeholder="xxxxxxxx"
                value={values.code}
                onChange={handleCodeChange}
                required
              />
            ) : (
              <Input
                autoFocus
                id="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={values.code}
                onChange={handleCodeChange}
                required
              />
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !values.code}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <button
            type="button"
            className="text-muted-foreground w-full text-center text-sm hover:underline"
            onClick={() => {
              setValues({ code: "" });
              setUseBackupCode((v) => !v);
            }}
          >
            {useBackupCode
              ? "Use authenticator app instead"
              : "Use a backup code instead"}
          </button>
        </CardContent>
      </form>
    </Card>
  );
}
