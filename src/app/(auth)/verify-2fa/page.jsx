"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = useBackupCode
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code });

    if (error) {
      toast.error(error.message ?? "Invalid code. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
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
                id="code"
                type="text"
                placeholder="xxxxxxxx"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                required
              />
            ) : (
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !code}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <button
            type="button"
            className="text-muted-foreground w-full text-center text-sm hover:underline"
            onClick={() => {
              setCode("");
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
