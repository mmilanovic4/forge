import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile } from "./tab-profile";
import { Security } from "./tab-security";
import { Sessions } from "./tab-sessions";
import { DangerZone } from "./tab-danger-zone";

export default function Settings() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>
      <Tabs defaultValue="profile">
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
