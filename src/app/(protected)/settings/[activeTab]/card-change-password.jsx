"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { setPasswordAction } from "@/app/actions/password";
import { PasswordHint, PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useForm } from "@/hooks/use-form";
import { MIN_PASSWORD_LENGTH } from "@/lib/app-config";
import { authClient } from "@/lib/auth-client";

export function ChangePassword() {
  const { values, handleChange, reset } = useForm({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (values.newPassword !== values.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Password changed successfully.");
    reset();
    setLoading(false);
  }

  return (
    <Card className="col-span-2 md:col-span-1">
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
              name="currentPassword"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              aria-describedby="newPassword-hint"
              value={values.newPassword}
              onChange={handleChange}
              required
            />
            <PasswordHint id="newPassword-hint" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              value={values.confirm}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={
                loading ||
                !values.currentPassword ||
                !values.newPassword ||
                !values.confirm
              }
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

// For accounts that never had a password, e.g. created through a social
// provider. Setting one adds email + password as a way to sign in, and is
// what two-factor authentication builds on.
export function SetPassword() {
  const router = useRouter();
  const { values, handleChange } = useForm({ newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (values.newPassword !== values.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await setPasswordAction(values.newPassword);

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    toast.success("Password set. You can now sign in with it.");
    router.refresh();
  }

  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Set a password</CardTitle>
        <CardDescription>
          Your account has no password yet. Add one to sign in with your email
          and password, and to turn on two-factor authentication.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setPassword">New password</Label>
            <PasswordInput
              id="setPassword"
              name="newPassword"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              aria-describedby="setPassword-hint"
              value={values.newPassword}
              onChange={handleChange}
              required
            />
            <PasswordHint id="setPassword-hint" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setPasswordConfirm">Confirm password</Label>
            <PasswordInput
              id="setPasswordConfirm"
              name="confirm"
              autoComplete="new-password"
              value={values.confirm}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={loading || !values.newPassword || !values.confirm}
            >
              {loading ? "Saving..." : "Set password"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
