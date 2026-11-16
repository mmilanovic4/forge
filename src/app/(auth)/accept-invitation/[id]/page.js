import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { organizationsEnabled } from "@/lib/app-config";
import { db } from "@/lib/db";
import { invitationPath } from "@/lib/organization/invitation";
import { getPendingInvitation } from "@/lib/organization/queries";
import { getSession } from "@/lib/session";

import { InvitationActions, SignOutButton } from "./invitation-actions";

export const metadata = {
  title: "Invitation",
};

export default async function AcceptInvitation({ params }) {
  if (!organizationsEnabled) notFound();

  const { id } = await params;

  const [session, invitation] = await Promise.all([
    getSession(),
    getPendingInvitation(id),
  ]);

  if (!invitation) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invitation unavailable</CardTitle>
          <CardDescription>
            This invitation has expired, was cancelled, or has already been
            used. Ask the person who invited you to send a new one.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={session ? "/dashboard" : "/login"}>
              {session ? "Go to dashboard" : "Back to login"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const here = invitationPath(id);
  // The link already names the address, so saying whether it has an account
  // reveals nothing new to whoever holds it — and saves the invitee guessing
  // between "Sign in" and "Create account". better-auth stores emails
  // lowercased.
  const hasAccount =
    !session &&
    !!(await db.user.findUnique({
      where: { email: invitation.email.toLowerCase() },
      select: { id: true },
    }));
  const authParams = new URLSearchParams({
    email: invitation.email,
    redirect: here,
  });
  const isRecipient =
    session?.user.email.toLowerCase() === invitation.email.toLowerCase();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join {invitation.organization.name}</CardTitle>
        <CardDescription>
          {invitation.inviter.name} invited <strong>{invitation.email}</strong>{" "}
          to join as {invitation.role ?? "member"}.
        </CardDescription>
      </CardHeader>
      {!session && (
        <>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {hasAccount
                ? "Sign in with this email address to accept."
                : "Create an account with this email address to accept."}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link
                href={`${hasAccount ? "/login" : "/register"}?${authParams}`}
              >
                {hasAccount ? "Sign in" : "Create account"}
              </Link>
            </Button>
          </CardFooter>
        </>
      )}
      {session && !isRecipient && (
        <>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              You are signed in as <strong>{session.user.email}</strong>. Sign
              out and continue with the invited address to accept.
            </p>
          </CardContent>
          <CardFooter>
            <SignOutButton redirectTo={here} />
          </CardFooter>
        </>
      )}
      {isRecipient && (
        <CardFooter>
          <InvitationActions invitationId={id} />
        </CardFooter>
      )}
    </Card>
  );
}
