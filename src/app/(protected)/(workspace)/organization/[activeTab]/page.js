import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Settings, Users } from "lucide-react";

import { LinkTabs } from "@/components/ui/link-tabs";
import { organizationsEnabled } from "@/lib/app-config";
import { requireActiveOrganization } from "@/lib/organization/queries";

import { MembersTab } from "./tab-members";
import { SettingsTab } from "./tab-settings";

const TABS = [
  {
    value: "members",
    href: "/organization/members",
    label: "Members",
    icon: Users,
  },
  {
    value: "settings",
    href: "/organization/settings",
    label: "Settings",
    icon: Settings,
  },
];

function TabContent({ activeTab }) {
  switch (activeTab) {
    case "members":
      return <MembersTab />;
    case "settings":
      return <SettingsTab />;
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
  title: "Organization",
};

// The active organization: who is in it and how it is set up. What belongs to
// the signed-in user alone lives under /settings instead.
export default async function Organization({ params }) {
  if (!organizationsEnabled) notFound();

  const { activeTab } = await params;

  if (!TABS.some((tab) => tab.value === activeTab)) {
    notFound();
  }

  const { organization, member } = await requireActiveOrganization();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          {organization.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          You are {member.role === "member" ? "a" : "an"} {member.role} of this
          organization.
        </p>
      </div>
      <LinkTabs tabs={TABS} activeTab={activeTab} className="mb-6" />
      {/* Keyed so switching tabs re-suspends instead of holding the old tab,
          and switching organizations resets whatever was typed into a form. */}
      <Suspense
        key={`${organization.id}:${activeTab}`}
        fallback={<TabFallback />}
      >
        <TabContent activeTab={activeTab} />
      </Suspense>
    </div>
  );
}
