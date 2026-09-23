"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { PasskeySignIn } from "@/components/passkey-sign-in";
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

const authMethod = process.env.NEXT_PUBLIC_AUTH_METHOD;

const isPasswordless = (authMethod) => {
  return authMethod === "otp" || authMethod === "magic-link";
};

export function LoginClient({ email, emailEnabled, providers, redirectTo }) {
  const router = useRouter();
  const { values, handleChange } = useForm({ email, password: "" });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // A 2FA challenge interrupts the sign-in; carry the destination through it.
  function continueSignIn(data) {
    router.push(
      data?.twoFactorRedirect
        ? `/verify-2fa?${new URLSearchParams({ redirect: redirectTo })}`
        : redirectTo,
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // otp
    if (authMethod === "otp") {
      if (!otpSent) {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email: values.email,
          type: "sign-in",
        });

        if (error) {
          toast.error(
            error.message ?? "Something went wrong. Please try again.",
          );
          setLoading(false);
          return;
        }

        setOtpSent(true);
        setLoading(false);
        return;
      }

      const { data, error } = await authClient.signIn.emailOtp({
        email: values.email,
        otp: values.otp,
      });

      if (error) {
        toast.error(error.message ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      continueSignIn(data);
      return;
    }

    // magic-link
    if (authMethod === "magic-link") {
      const { error } = await authClient.signIn.magicLink({
        email: values.email,
        callbackURL: redirectTo,
        // Otherwise a failed link — e.g. for an address with no account —
        // lands on callbackURL, which bounces a visitor to login unexplained.
        errorCallbackURL: "/auth-error",
      });

      if (error) {
        toast.error(error.message ?? "Something went wrong. Please try again.");
      } else {
        toast.success("Magic link sent! Check your email.");
      }

      setLoading(false);
      return;
    }

    // email + password
    const { data, error } = await authClient.signIn.email({ ...values });

    if (error) {
      // Only reported once the password has checked out, so this is the
      // account's owner — likely with an expired or lost link. Send a fresh one
      // rather than leave them stuck.
      if (error.code === "EMAIL_NOT_VERIFIED") {
        const { error: sendError } = await authClient.sendVerificationEmail({
          email: values.email,
          callbackURL: redirectTo,
        });
        if (!sendError) {
          const params = new URLSearchParams({
            email: values.email,
            redirect: redirectTo,
            resent: "1",
          });
          router.push(`/verify-email?${params}`);
          return;
        }
        toast.error("Please verify your email before signing in.");
      } else if (error.code === "USER_BANNED") {
        toast.error("Your account has been banned. Please contact support.");
      } else {
        toast.error(error.message ?? "Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    continueSignIn(data);
  }

  const passwordless = isPasswordless(authMethod);
  const buttonDisabled =
    loading ||
    !values.email ||
    (!passwordless && !values.password) ||
    (authMethod === "otp" && otpSent && !values.otp);

  const buttonLabel = () => {
    if (loading) return "Loading...";
    if (authMethod === "magic-link") return "Send magic link";
    if (authMethod === "otp") return otpSent ? "Sign in" : "Send code";
    return "Sign in";
  };

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
              disabled={authMethod === "otp" && otpSent}
            />
          </div>
          {authMethod === "otp" && otpSent && (
            <div className="space-y-2">
              <Label htmlFor="otp">Code</Label>
              <Input
                autoFocus
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={values.otp ?? ""}
                onChange={handleChange}
                required
              />
            </div>
          )}
          {!passwordless && (
            <>
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
            </>
          )}
          <Button type="submit" className="w-full" disabled={buttonDisabled}>
            {buttonLabel()}
          </Button>
          <PasskeySignIn className="w-full" callbackURL={redirectTo} />
          <SocialSignIn
            providers={providers}
            requestSignUp={false}
            callbackURL={redirectTo}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-1">
          <p className="text-muted-foreground text-sm">
            {"Don't"} have an account?
          </p>
          <Link
            href={
              redirectTo === "/dashboard"
                ? "/register"
                : `/register?redirect=${encodeURIComponent(redirectTo)}`
            }
            className="text-primary text-sm hover:underline"
          >
            Sign up
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
