"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

const FALLBACK_ERROR = "Something went wrong. Please try again.";

/**
 * Runs auth-client calls the way every button in the app wants them run:
 * failures become a toast, success refreshes the server-rendered data.
 *
 *   const { pending, run } = useAction();
 *   run("remove", () => authClient.organization.removeMember(…), {
 *     success: "Member removed.",
 *   });
 *
 * `pending` is the key of the call in flight (or `null`), so a button can show
 * its own progress while the others are merely disabled. `run` resolves to
 * `{ ok, data }`.
 */
export function useAction() {
  const router = useRouter();
  const [pending, setPending] = useState(null);

  async function run(key, action, { success, redirectTo } = {}) {
    setPending(key);

    let result;
    try {
      result = await action();
    } catch {
      // The client resolves with `{ error }` for anything the server said;
      // what throws is the request never getting there.
      result = { error: {} };
    }

    if (result.error) {
      setPending(null);
      toast.error(result.error.message ?? FALLBACK_ERROR);
      return { ok: false };
    }

    if (success) toast.success(success);

    if (redirectTo) {
      // Still pending on purpose: the button stays busy until the next page
      // replaces it. Pushing alone would keep the shared layout — and the
      // organization switcher in it — as rendered before the change.
      router.push(redirectTo);
    } else {
      setPending(null);
    }
    router.refresh();

    return { ok: true, data: result.data };
  }

  return { pending, run };
}
