import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const errorMessages = {
  access_denied: "Access was denied. Please try again.",
  account_not_found: "No account found with this email.",
  account_not_linked:
    "An account already exists with this email. Please sign in with your password.",
  email_already_exists:
    "An account with this email already exists. Please sign in with your password.",
  social_account_already_linked:
    "This social account is already linked to another user.",
  signup_disabled: "No account found with this email. Please sign up first.",
};

export function AuthErrorCard({ error }) {
  const message =
    errorMessages[error] ?? "Something went wrong. Please try again.";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Error</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground font-mono text-sm">{error}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/login">Back to login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
