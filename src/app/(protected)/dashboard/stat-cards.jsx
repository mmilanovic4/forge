import { MonitorSmartphone, UserPlus, Users } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { getUserStats } from "@/lib/data-helper";

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardAction>
          <Icon className="text-muted-foreground h-4 w-4" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">
          {value.toLocaleString("en-US")}
        </p>
        <p className="text-muted-foreground text-xs">{detail}</p>
      </CardContent>
    </Card>
  );
}

export async function StatCards() {
  const { totalUsers, activeSessions, newUsers } = await getUserStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Users}
        label="Current users"
        value={totalUsers}
        detail="Registered accounts"
      />
      <StatCard
        icon={MonitorSmartphone}
        label="Active sessions"
        value={activeSessions}
        detail="Signed-in devices"
      />
      <StatCard
        icon={UserPlus}
        label="New this week"
        value={newUsers}
        detail="Signed up in the last 7 days"
      />
    </div>
  );
}
