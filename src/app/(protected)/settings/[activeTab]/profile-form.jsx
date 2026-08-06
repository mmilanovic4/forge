"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { removeImageAction } from "@/app/actions/upload";
import { FileUpload } from "@/components/file-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function ProfileForm({ user, s3Enabled }) {
  const router = useRouter();
  const { values, handleChange, setValues } = useForm({
    id: user.id ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    image: user.image ?? "",
    createdAt: user.createdAt ?? null,
  });
  const [loading, setLoading] = useState(false);

  async function handleAvatarUploaded({ url }) {
    const { error } = await authClient.updateUser({ image: url });
    if (error) {
      toast.error(error.message ?? "Could not update avatar.");
      return;
    }
    setValues((prev) => ({ ...prev, image: url }));
    toast.success("Avatar updated.");
    router.refresh();
  }

  async function handleRemoveAvatar() {
    await removeImageAction(values.image);
    const { error } = await authClient.updateUser({ image: null });
    if (error) {
      toast.error(error.message ?? "Could not remove avatar.");
      return;
    }
    setValues((prev) => ({ ...prev, image: "" }));
    toast.success("Avatar removed.");
    router.refresh();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.updateUser({
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Profile updated.");
    router.refresh();
    setLoading(false);
  }

  const initials =
    `${values.firstName?.[0] || ""}${values.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="grid grid-cols-2 items-start gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <div className="relative">
                <Input value={values.id} disabled className="pr-20" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-1 my-auto h-7"
                  onClick={() => {
                    navigator.clipboard.writeText(values.id);
                    toast.success("User ID copied to clipboard");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={values.email}
                disabled
              />
              <p className="text-muted-foreground text-xs">
                Email cannot be changed.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Member since</Label>
              <Input
                value={
                  values.createdAt
                    ? new Date(values.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""
                }
                disabled
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !values.firstName || !values.lastName}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </form>
      </Card>

      {s3Enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Update your profile photo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar size="lg">
                {values.image && (
                  <AvatarImage src={values.image} alt={initials} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
            <FileUpload
              accept="image/*"
              className="w-full p-4"
              onUploaded={handleAvatarUploaded}
            />
            {values.image && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive h-auto p-0"
                  onClick={handleRemoveAvatar}
                >
                  Remove avatar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
