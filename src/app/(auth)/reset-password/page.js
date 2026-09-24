import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ResetPasswordClient } from "./reset-password-client";

export const metadata = {
  title: "Reset password",
};

export default async function ResetPassword({ searchParams }) {
  const { token, error } = await searchParams;

  // better-auth sends a bad or expired link here with ?error=; a visit with no
  // token at all has nothing to reset either, and would only fail on submit.
  if (error || typeof token !== "string" || !token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid or expired link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired. Please request a
            new one.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return <ResetPasswordClient token={token} />;
}
