"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function SocialSignIn({
  providers,
  requestSignUp = false,
  callbackURL = "/dashboard",
}) {
  const [pending, setPending] = useState(null);

  // Back from the provider's page, the browser may restore this one from its
  // back/forward cache — buttons still disabled mid-"redirect". Re-enable them.
  useEffect(() => {
    const reset = (e) => e.persisted && setPending(null);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  if (!providers.length) {
    return null;
  }

  async function handleClick(provider) {
    setPending(provider);

    // On success the browser leaves for the provider, so the buttons stay
    // disabled until the page is gone; only a failure brings them back.
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL,
      requestSignUp,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setPending(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">or continue with</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex gap-2">
        {providers.map(({ id, label }) => {
          return (
            <Button
              key={id}
              type="button"
              variant="outline"
              className="flex-1"
              disabled={pending !== null}
              onClick={() => handleClick(id)}
            >
              {pending === id && <Loader2 className="animate-spin" />}
              {label}
            </Button>
          );
        })}
      </div>
    </>
  );
}
