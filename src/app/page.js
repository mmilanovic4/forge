import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Home",
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-3">
        <h1 className="text-4xl font-semibold tracking-tight">
          Build something great.
        </h1>
        <p className="text-muted-foreground">
          Forge is a minimal Next.js boilerplate with auth, database and a
          component library ready to go.
        </p>
      </div>
      <div className="flex gap-3">
        {session ? (
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
