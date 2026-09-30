import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

/**
 * For pages that wait on an emailed link: the link usually opens in another
 * tab or window and signs the user in there, leaving this one asking them to
 * check their email. Coming back to it moves on to `redirectTo`.
 */
export function useSignedInRedirect(redirectTo) {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();

  // `useSession` already refetches when a hidden tab becomes visible; a window
  // that sat side by side with the one the link opened in was never hidden.
  useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  useEffect(() => {
    if (session) router.replace(redirectTo);
  }, [session, redirectTo, router]);
}
