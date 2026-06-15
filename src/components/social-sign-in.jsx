import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function SocialSignIn() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">or continue with</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() =>
            authClient.signIn.social({
              provider: "discord",
              callbackURL: "/dashboard",
            })
          }
        >
          Discord
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() =>
            authClient.signIn.social({
              provider: "github",
              callbackURL: "/dashboard",
            })
          }
        >
          GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() =>
            authClient.signIn.social({
              provider: "google",
              callbackURL: "/dashboard",
            })
          }
        >
          Google
        </Button>
      </div>
    </>
  );
}
