"use client";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function SocialSignIn({ providers, requestSignUp = false }) {
  if (!providers.length) {
    return null;
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
              onClick={() =>
                authClient.signIn.social({
                  provider: id,
                  callbackURL: "/dashboard",
                  requestSignUp,
                })
              }
            >
              {label}
            </Button>
          );
        })}
      </div>
    </>
  );
}
