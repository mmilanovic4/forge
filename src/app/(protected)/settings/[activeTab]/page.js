import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  MonitorSmartphone,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { LinkTabs } from "@/components/ui/link-tabs";

import { DangerZone } from "./tab-danger-zone";
import { Profile } from "./tab-profile";
import { Security } from "./tab-security";
import { Sessions } from "./tab-sessions";

const TABS = [
  {
    value: "profile",
    href: "/settings/profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    value: "security",
    href: "/settings/security",
    label: "Security",
    icon: ShieldCheck,
  },
  {
    value: "sessions",
    href: "/settings/sessions",
    label: "Sessions",
    icon: MonitorSmartphone,
  },
  {
    value: "danger",
    href: "/settings/danger",
    label: "Danger Zone",
    icon: TriangleAlert,
  },
];

function TabContent({ activeTab }) {
  switch (activeTab) {
    case "profile":
      return <Profile />;
    case "security":
      return <Security />;
    case "sessions":
      return <Sessions />;
    case "danger":
      return <DangerZone />;
    default:
      return null;
  }
}

function TabFallback() {
  return (
    <div className="bg-muted/40 h-64 w-full animate-pulse rounded-xl border" />
  );
}

export const metadata = {
  title: "Settings",
};

export default async function Settings({ params }) {
  const { activeTab } = await params;

  if (!TABS.some((tab) => tab.value === activeTab)) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>
      <LinkTabs tabs={TABS} activeTab={activeTab} className="mb-6" />
      {/* Keyed so switching tabs re-suspends instead of holding the old tab. */}
      <Suspense key={activeTab} fallback={<TabFallback />}>
        <TabContent activeTab={activeTab} />
      </Suspense>
    </div>
  );
}
