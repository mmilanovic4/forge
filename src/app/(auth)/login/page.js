"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { useAppContext } from "@/components/app-provider";
import { PasswordInput } from "@/components/password-input";
import { SocialSignIn } from "@/components/social-sign-in";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@/hooks/use-form";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const { emailEnabled } = useAppContext();
  const { values, handleChange } = useForm({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authClient.signOut();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await authClient.signIn.email({
      ...values,
    });

    if (error) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        toast.error("Please verify your email before signing in.");
      } else if (error.code === "USER_BANNED") {
        toast.error("Your account has been banned. Please contact support.");
      } else {
        toast.error(error.message ?? "Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    if (data?.twoFactorRedirect) return;

    router.push("/dashboard");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoFocus
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
          {emailEnabled && (
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-muted-foreground text-xs hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !values.email || !values.password}
          >
            {loading ? "Loading..." : "Sign in"}
          </Button>
          <SocialSignIn />
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-1">
          <p className="text-muted-foreground text-sm">
            {"Don't"} have an account?
          </p>
          <Link
            href="/register"
            className="text-primary text-sm hover:underline"
          >
            Sign up
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
