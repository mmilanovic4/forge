import { headers } from "next/headers";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { describeUserAgent } from "@/lib/user-agent";

import {
  RevokeOtherSessionsButton,
  RevokeSessionButton,
} from "./session-actions";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Without a proxy passing the client address on (e.g. in local development)
// better-auth stores the unspecified address, which says nothing.
const knownIp = (ip) => (ip && !/^[0:.]+$/.test(ip) ? ip : null);

export async function Sessions() {
  const hdrs = await headers();

  const [activeSession, sessions] = await Promise.all([
    getSession(),
    auth.api.listSessions({ headers: hdrs }),
  ]);

  const currentId = activeSession?.session?.id;
  const list = sessions ?? [];
  const hasOtherSessions = list.some((session) => session.id !== currentId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {list.map((session) => {
            const isCurrent = session.id === currentId;

            return (
              <div
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium"
                    title={session.userAgent ?? undefined}
                  >
                    {describeUserAgent(session.userAgent)}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {[
                      knownIp(session.ipAddress),
                      `signed in ${formatDate(session.createdAt)}`,
                      // Refreshed as the session is used, so it doubles as
                      // "last active".
                      !isCurrent &&
                        `last active ${formatDate(session.updatedAt)}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {isCurrent ? (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    Current
                  </Badge>
                ) : (
                  <RevokeSessionButton sessionId={session.id} />
                )}
              </div>
            );
          })}
        </div>
        {hasOtherSessions && <RevokeOtherSessionsButton />}
      </CardContent>
    </Card>
  );
}
