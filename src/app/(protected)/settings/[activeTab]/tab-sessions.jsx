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

import {
  RevokeOtherSessionsButton,
  RevokeSessionButton,
} from "./session-actions";

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
                  <p className="truncate text-sm font-medium">
                    {session.userAgent ?? "Unknown device"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(session.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
