"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="profile" className="flex-1">
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1">
            Security
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex-1">
            Danger Zone
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionsTab />
        </TabsContent>
        <TabsContent value="danger">
          <DangerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTab() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setFirstName(data.user.firstName ?? "");
        setLastName(data.user.lastName ?? "");
        setEmail(data.user.email ?? "");
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.updateUser({ firstName, lastName });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Profile updated.");
    setLoading(false);
  }

  return (
    <Card className="w-full md:max-w-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your display name.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled />
            <p className="text-muted-foreground text-xs">
              Email cannot be changed.
            </p>
          </div>
          <Button type="submit" disabled={loading || !firstName || !lastName}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <ChangePasswordCard />
      <TwoFactorCard />
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (newPassword !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setLoading(false);
  }

  return (
    <Card className="w-full md:max-w-md">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          You will be signed out of all other sessions.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirm}
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}

function TwoFactorCard() {
  const [status, setStatus] = useState("loading");
  const [password, setPassword] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
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

    const { data, error } = await authClient.twoFactor.enable({ password });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setTotpUri(data.totpURI);
    setBackupCodes(data.backupCodes);
    setPassword("");
    setLoading(false);
    setStatus("setup");
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.twoFactor.verifyTotp({ code });

    if (error) {
      toast.error(error.message ?? "Invalid code. Please try again.");
      setLoading(false);
      return;
    }

    setCode("");
    setLoading(false);
    setStatus("backup_codes");
  }

  async function handleDisable() {
    setDisableLoading(true);

    const { error } = await authClient.twoFactor.disable({
      password: disablePassword,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setDisableLoading(false);
      return;
    }

    toast.success("Two-factor authentication disabled.");
    setDisablePassword("");
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
      <Card className="w-full md:max-w-md">
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
      <Card className="w-full md:max-w-md">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !password}>
                {loading ? "Setting up..." : "Continue"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPassword("");
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
      <Card className="w-full md:max-w-md">
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
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <Button type="submit" disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify & Activate"}
            </Button>
          </CardContent>
        </form>
      </Card>
    );
  }

  if (status === "backup_codes") {
    return (
      <Card className="w-full md:max-w-md">
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
    <Card className="w-full md:max-w-md">
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
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDisablePassword("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={disableLoading || !disablePassword}
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

function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.listSessions().then(({ data }) => {
      setSessions(data ?? []);
      setLoading(false);
    });
  }, []);

  async function handleRevoke(sessionToken) {
    const { error } = await authClient.revokeSession({ token: sessionToken });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSessions((prev) => prev.filter((s) => s.token !== sessionToken));
    toast.success("Session revoked.");
  }

  async function handleRevokeAll() {
    const { error } = await authClient.revokeOtherSessions();

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    const { data } = await authClient.listSessions();
    setSessions(data ?? []);
    toast.success("All other sessions revoked.");
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="max-w-48 truncate text-sm font-medium">
                        {session.userAgent ?? "Unknown device"}
                      </p>
                      {session.current && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {new Date(session.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRevoke(session.token)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRevokeAll}
              >
                Revoke all other sessions
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DangerTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const { error } = await authClient.deleteUser({
      callbackURL: "/",
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <Card className="border-destructive/50 w-full md:max-w-md">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              {loading ? "Deleting..." : "Delete account"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Your account and all associated
                data will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
