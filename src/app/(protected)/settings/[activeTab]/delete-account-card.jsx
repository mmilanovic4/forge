"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { PasswordInput } from "@/components/password-input";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const DIALOG_TEXT = {
  email: (email) =>
    `We'll email a confirmation link to ${email}. Your account and all associated data are permanently deleted once you open it.`,
  password: () =>
    "This action cannot be undone. Your account and all associated data will be permanently deleted. Enter your password to confirm.",
  session: () =>
    "This action cannot be undone. Your account and all associated data will be permanently deleted.",
};

// `confirmBy` is "email", "password" or "session" — see tab-danger-zone.jsx.
export function DeleteAccountCard({ confirmBy, email }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [password, setPassword] = useState("");

  async function handleDelete() {
    setLoading(true);

    const { error } = await authClient.deleteUser({
      callbackURL: "/",
      ...(confirmBy === "password" && { password }),
    });

    setPassword("");

    if (error) {
      toast.error(
        // Only reachable without a password to ask for: the session is the
        // sole proof left, and it has to be a recent one.
        error.code === "SESSION_EXPIRED"
          ? "For your security, sign out and sign in again before deleting your account."
          : (error.message ?? "Something went wrong. Please try again."),
      );
      setLoading(false);
      return;
    }

    if (confirmBy === "email") {
      setLinkSent(true);
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <Card className="border-destructive/50 w-full">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          {linkSent ? (
            <>
              We sent a confirmation link to <strong>{email}</strong>. Open it
              in this browser within 1 hour to delete your account — until then,
              nothing changes.
            </>
          ) : (
            "Permanently delete your account and all associated data."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              {loading
                ? confirmBy === "email"
                  ? "Sending..."
                  : "Deleting..."
                : linkSent
                  ? "Send link again"
                  : "Delete account"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {DIALOG_TEXT[confirmBy](email)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {confirmBy === "password" && (
              <div className="space-y-2 px-1 pb-2">
                <Label htmlFor="delete-password">Password</Label>
                <PasswordInput
                  id="delete-password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPassword("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={confirmBy === "password" && !password}
                onClick={handleDelete}
              >
                {confirmBy === "email"
                  ? "Send confirmation link"
                  : "Delete account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
