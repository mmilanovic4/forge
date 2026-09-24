"use client";

import { ResendButton } from "@/components/resend-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// What login and register show once a code or link is on its way: a way to
// ask for another, and a way out when the address was mistyped.

export function LinkSentCard({ email, purpose, onResend, onChangeEmail }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We sent a {purpose} link to <strong>{email}</strong>. It expires in 5
          minutes.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col gap-2">
        <ResendButton
          className="w-full"
          label="Resend link"
          successMessage="New link sent."
          onResend={onResend}
        />
        <Button variant="outline" className="w-full" onClick={onChangeEmail}>
          Use a different email
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CodeSentActions({ onResend, onChangeEmail }) {
  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="link"
        size="sm"
        className="text-muted-foreground h-auto p-0"
        onClick={onChangeEmail}
      >
        Use a different email
      </Button>
      <ResendButton
        variant="link"
        size="sm"
        className="text-muted-foreground h-auto p-0"
        label="Resend code"
        successMessage="New code sent."
        onResend={onResend}
      />
    </div>
  );
}
