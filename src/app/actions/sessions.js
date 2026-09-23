"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// better-auth revokes by token, but a token is a bearer credential for that
// session — so the client only ever sees the id, and the token is looked up
// here among the caller's own sessions.
export async function revokeSessionAction(sessionId) {
  const hdrs = await headers();

  try {
    const sessions = await auth.api.listSessions({ headers: hdrs });
    const target = sessions.find((session) => session.id === sessionId);
    if (!target) {
      return { error: "Session not found." };
    }

    await auth.api.revokeSession({
      body: { token: target.token },
      headers: hdrs,
    });
  } catch (err) {
    return { error: err.message ?? "Something went wrong. Please try again." };
  }

  return { ok: true };
}
