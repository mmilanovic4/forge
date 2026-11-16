import { MonitorSmartphone, UserPlus, Users } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { organizationsEnabled } from "@/lib/app-config";
import { getUserStats } from "@/lib/data-helper";
import { getOrganizationStats } from "@/lib/organization/queries";

// The same three numbers either way: about the active organization, or about
// the whole app when it has no organizations.
const COPY = organizationsEnabled
  ? {
      total: ["Members", "In this organization"],
      activeSessions: ["Active sessions", "Signed in to this organization"],
      recent: ["New this week", "Joined in the last 7 days"],
    }
  : {
      total: ["Current users", "Registered accounts"],
      activeSessions: ["Active sessions", "Signed-in devices"],
      recent: ["New this week", "Signed up in the last 7 days"],
    };

const ICONS = {
  total: Users,
  activeSessions: MonitorSmartphone,
  recent: UserPlus,
};

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
  const stats = await (organizationsEnabled
    ? getOrganizationStats()
    : getUserStats());

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Object.entries(COPY).map(([key, [label, detail]]) => (
        <StatCard
          key={key}
          icon={ICONS[key]}
          label={label}
          value={stats[key]}
          detail={detail}
        />
      ))}
    </div>
  );
}
