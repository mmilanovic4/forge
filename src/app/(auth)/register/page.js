"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/password-input";
import { useForm } from "@/hooks/use-form";

export default function RegisterPage() {
  const router = useRouter();
  const { values, handleChange } = useForm({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authClient.signOut();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.signUp.email({
      name: `${values.firstName} ${values.lastName}`,
      ...values,
      callbackURL: "/dashboard",
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/verify-email");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Sign up to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
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
              placeholder="Doe"
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
              placeholder="john@example.com"
              value={values.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              !values.firstName ||
              !values.lastName ||
              !values.email ||
              !values.password
            }
          >
            {loading ? "Loading..." : "Create account"}
          </Button>
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">
              or continue with
            </span>
            <Separator className="flex-1" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                authClient.signIn.social({
                  provider: "github",
                  callbackURL: "/dashboard",
                })
              }
            >
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/dashboard",
                })
              }
            >
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-1">
          <p className="text-muted-foreground text-sm">
            Already have an account?
          </p>
          <Link href="/login" className="text-primary text-sm hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
