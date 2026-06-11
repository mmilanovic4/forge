"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { use } from "react";

import { MonitorSmartphone, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DangerZone } from "./tab-danger-zone";
import { Profile } from "./tab-profile";
import { Security } from "./tab-security";
import { Sessions } from "./tab-sessions";

const VALID_TABS = ["profile", "security", "sessions", "danger"];

export default function Settings({ params }) {
  const router = useRouter();
  const { activeTab } = use(params);

  if (!VALID_TABS.includes(activeTab)) {
    notFound();
  }

  function handleTabChange(value) {
    router.push(`/settings/${value}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="profile" className="flex-1">
            <UserRound className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1">
            <MonitorSmartphone className="mr-2 h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex-1">
            <TriangleAlert className="mr-2 h-4 w-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Profile />
        </TabsContent>
        <TabsContent value="security">
          <Security />
        </TabsContent>
        <TabsContent value="sessions">
          <Sessions />
        </TabsContent>
        <TabsContent value="danger">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}
