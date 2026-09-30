"use client";

import { ResendLink } from "@/components/resend-link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSignedInRedirect } from "@/hooks/use-signed-in-redirect";

// What login and register show once a code or link is on its way: a way to
// ask for another, and a way out when the address was mistyped.

export function LinkSentCard({
  email,
  purpose,
  redirectTo,
  onResend,
  onChangeEmail,
}) {
  useSignedInRedirect(redirectTo);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We sent a {purpose} link to <strong>{email}</strong>. It expires in 5
          minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResendLink
          label="Resend link"
          successMessage="New link sent."
          onResend={onResend}
        />
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onChangeEmail}>
          Use a different email
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CodeSentActions({ onResend, onChangeEmail }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <Button
        type="button"
        variant="link"
        size="sm"
        className="text-muted-foreground h-auto p-0"
        onClick={onChangeEmail}
      >
        Use a different email
      </Button>
      <ResendLink
        className="text-[0.8rem]"
        hint={null}
        label="Resend code"
        successMessage="New code sent."
        onResend={onResend}
      />
    </div>
  );
}
