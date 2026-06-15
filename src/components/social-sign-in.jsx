import { authClient } from "@/lib/auth-client";

import { useAppContext } from "./app-provider";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const PROVIDER_LABELS = {
  discord: "Discord",
  github: "GitHub",
  google: "Google",
};

export function SocialSignIn() {
  const { providers } = useAppContext();

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
        {providers.map((provider) => {
          return (
            <Button
              key={provider}
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                authClient.signIn.social({
                  provider,
                  callbackURL: "/dashboard",
                })
              }
            >
              {PROVIDER_LABELS[provider] || provider}
            </Button>
          );
        })}
      </div>
    </>
  );
}
