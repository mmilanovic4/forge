"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { PasswordHint, PasswordInput } from "@/components/password-input";
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
import {
  authMethod,
  MIN_PASSWORD_LENGTH,
  passwordLogin,
} from "@/lib/app-config";
import { authClient } from "@/lib/auth-client";

export function RegisterClient({ email, providers, redirectTo }) {
  const router = useRouter();
  const { values, handleChange } = useForm({
    firstName: "",
    lastName: "",
    email,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const name = `${firstName} ${lastName}`;

  // Code and link sign-ins create the account on first use; sending a name
  // is what marks this as a sign-up rather than a login (see
  // validateUserInfo in lib/auth.js).
  async function signUp() {
    if (authMethod === "otp") {
      if (!otpSent) {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email: values.email,
          type: "sign-in",
        });
        if (!error) setOtpSent(true);
        return { error };
      }

      const { error } = await authClient.signIn.emailOtp({
        email: values.email,
        otp: values.otp,
        name,
        firstName,
        lastName,
      });
      return { error, next: redirectTo };
    }

    if (authMethod === "magic-link") {
      const { error } = await authClient.signIn.magicLink({
        email: values.email,
        name,
        callbackURL: redirectTo,
        errorCallbackURL: "/auth-error",
      });
      if (!error) setLinkSent(true);
      return { error };
    }

    const { data, error } = await authClient.signUp.email({
      name,
      firstName,
      lastName,
      email: values.email,
      password: values.password,
      callbackURL: redirectTo,
    });
    // No token means the account waits on email verification; the link in
    // that email signs the user in and continues to `redirectTo`.
    const params = new URLSearchParams({
      email: values.email,
      redirect: redirectTo,
    });
    return {
      error,
      next: data?.token ? redirectTo : `/verify-email?${params}`,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error, next } = await signUp();

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
    }
    if (error || !next) {
      setLoading(false);
      return;
    }

    router.push(next);
  }

  const buttonDisabled =
    loading ||
    !firstName ||
    !lastName ||
    !values.email ||
    (passwordLogin && !values.password) ||
    (authMethod === "otp" && otpSent && !values.otp);

  const buttonLabel = () => {
    if (loading) return "Loading...";
    if (authMethod === "otp" && !otpSent) return "Send code";
    if (authMethod === "magic-link") return "Send sign-up link";
    return "Create account";
  };

  if (linkSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a sign-up link to <strong>{values.email}</strong>. Open it
            to finish creating your account.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLinkSent(false)}
          >
            Use a different email
          </Button>
        </CardFooter>
      </Card>
    );
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
              autoFocus
              id="firstName"
              autoComplete="given-name"
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
              autoComplete="family-name"
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
              autoComplete="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={values.email}
              onChange={handleChange}
              required
              disabled={otpSent}
            />
          </div>
          {otpSent && (
            <div className="space-y-2">
              <Label htmlFor="otp">Code</Label>
              <Input
                autoFocus
                id="otp"
                autoComplete="one-time-code"
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
          {passwordLogin && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                aria-describedby="password-hint"
                name="password"
                value={values.password}
                onChange={handleChange}
                required
              />
              <PasswordHint id="password-hint" />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={buttonDisabled}>
            {buttonLabel()}
          </Button>
          <SocialSignIn
            providers={providers}
            requestSignUp
            callbackURL={redirectTo}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-1">
          <p className="text-muted-foreground text-sm">
            Already have an account?
          </p>
          <Link
            href={
              redirectTo === "/dashboard"
                ? "/login"
                : `/login?redirect=${encodeURIComponent(redirectTo)}`
            }
            className="text-primary text-sm hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
