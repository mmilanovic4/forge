import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/user-menu";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session.user;

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                User ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="truncate font-mono text-sm">{user.id}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
