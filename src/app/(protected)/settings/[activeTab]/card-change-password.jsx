"use client";

import { useState } from "react";

import { toast } from "sonner";

import { PasswordInput } from "@/components/password-input";
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
              value={values.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <PasswordInput
              id="confirm"
              name="confirm"
              value={values.confirm}
              onChange={handleChange}
              required
            />
          </div>
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
        </CardContent>
      </form>
    </Card>
  );
}
