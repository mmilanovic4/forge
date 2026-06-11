"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function Sessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.listSessions().then(({ data }) => {
      setSessions(data ?? []);
      setLoading(false);
    });
  }, []);

  async function handleRevoke(session) {
    const { error } = await authClient.revokeSession({ token: session.token });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSessions((prev) => prev.filter((s) => s.token !== session.token));
    toast.success("Session revoked.");
  }

  async function handleRevokeAll() {
    const { error } = await authClient.revokeOtherSessions();

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    const { data } = await authClient.listSessions();
    setSessions(data ?? []);
    toast.success("All other sessions revoked.");
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex max-w-4/5 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {session.userAgent ?? "Unknown device"}
                      </p>
                      {session.current && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {new Date(session.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRevoke(session)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRevokeAll}
              >
                Revoke all other sessions
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
