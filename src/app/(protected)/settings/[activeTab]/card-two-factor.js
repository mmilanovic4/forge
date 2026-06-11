"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useForm } from "@/hooks/use-form";
import { QRCodeSVG } from "qrcode.react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PasswordInput } from "@/components/password-input";

export function TwoFactor() {
  const [status, setStatus] = useState("loading");
  const {
    values: enableValues,
    handleChange: handleEnableChange,
    setValues: setEnableValues,
  } = useForm({
    password: "",
  });
  const { values: verifyValues, setValues: setVerifyValues } = useForm({
    code: "",
  });
  const {
    values: disableValues,
    handleChange: handleDisableChange,
    setValues: setDisableValues,
  } = useForm({
    password: "",
  });
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setStatus(data.user.twoFactorEnabled ? "enabled" : "disabled");
      }
    });
  }, []);

  async function handleEnable(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await authClient.twoFactor.enable({
      password: enableValues.password,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setTotpUri(data.totpURI);
    setBackupCodes(data.backupCodes);
    setEnableValues({ password: "" });
    setLoading(false);
    setStatus("setup");
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.twoFactor.verifyTotp({
      code: verifyValues.code,
    });

    if (error) {
      toast.error(error.message ?? "Invalid code. Please try again.");
      setLoading(false);
      return;
    }

    setVerifyValues({ code: "" });
    setLoading(false);
    setStatus("backup_codes");
  }

  async function handleDisable() {
    setDisableLoading(true);

    const { error } = await authClient.twoFactor.disable({
      password: disableValues.password,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setDisableLoading(false);
      return;
    }

    toast.success("Two-factor authentication disabled.");
    setDisableValues({ password: "" });
    setDisableLoading(false);
    setStatus("disabled");
  }

  const copyAllCodes = useCallback(() => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied.");
  }, [backupCodes]);

  if (status === "loading") {
    return (
      <Card className="w-full md:max-w-md">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "disabled") {
    return (
      <Card className="col-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security by requiring a code from your
            authenticator app each time you sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setStatus("enter_password")}>
            Enable 2FA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "enter_password") {
    return (
      <Card className="col-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Enable two-factor authentication</CardTitle>
          <CardDescription>Enter your password to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={handleEnable}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tfa-password">Password</Label>
              <PasswordInput
                id="tfa-password"
                name="password"
                value={enableValues.password}
                onChange={handleEnableChange}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading || !enableValues.password}
              >
                {loading ? "Setting up..." : "Continue"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEnableValues({ password: "" });
                  setStatus("disabled");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    );
  }

  if (status === "setup") {
    return (
      <Card className="col-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Scan the QR code</CardTitle>
          <CardDescription>
            Use your authenticator app to scan the QR code, then enter the
            6-digit code to verify.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            <div className="flex justify-center rounded-lg border p-4">
              <QRCodeSVG value={totpUri} size={160} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totp-code">Verification code</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verifyValues.code}
                onChange={(e) =>
                  setVerifyValues({ code: e.target.value.replace(/\D/g, "") })
                }
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || verifyValues.code.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Activate"}
            </Button>
          </CardContent>
        </form>
      </Card>
    );
  }

  if (status === "backup_codes") {
    return (
      <Card className="col-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Save your backup codes</CardTitle>
          <CardDescription>
            Store these in a safe place. Each code can only be used once to sign
            in if you lose access to your authenticator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg border p-4 font-mono text-sm">
            {backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyAllCodes}>
              Copy all
            </Button>
            <Button
              onClick={() => {
                setBackupCodes([]);
                setTotpUri("");
                setStatus("enabled");
              }}
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">
            2FA is active
          </Badge>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Disable 2FA</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Disable two-factor authentication
              </AlertDialogTitle>
              <AlertDialogDescription>
                Enter your password to confirm. This will remove the extra
                security layer from your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 px-1 pb-2">
              <Label htmlFor="disable-password">Password</Label>
              <PasswordInput
                id="disable-password"
                name="password"
                value={disableValues.password}
                onChange={handleDisableChange}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setDisableValues({ password: "" })}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={disableLoading || !disableValues.password}
                onClick={handleDisable}
              >
                {disableLoading ? "Disabling..." : "Disable 2FA"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
