"use client";

import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useForm } from "@/hooks/use-form";
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

export function Profile() {
  const { values, handleChange, setValues } = useForm({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setValues({
          id: data.user.id ?? "",
          firstName: data.user.firstName ?? "",
          lastName: data.user.lastName ?? "",
          email: data.user.email ?? "",
          createdAt: data.user.createdAt ?? null,
        });
      }
    });
  }, [setValues]);

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
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
