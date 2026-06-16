import { use } from "react";

import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Settings",
};

export default function Settings({ params }) {
  const { activeTab } = use(params);
  return <SettingsClient activeTab={activeTab} />;
}
