"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile } from "./tab-profile";
import { Security } from "./tab-security";
import { Sessions } from "./tab-sessions";
import { DangerZone } from "./tab-danger-zone";

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
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1">
            Security
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex-1">
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
