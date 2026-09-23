import { getSession } from "@/lib/session";
import { s3Enabled } from "@/lib/storage/config";

import { ProfileForm } from "./profile-form";

export async function Profile() {
  const session = await getSession();
  const { id, firstName, lastName, email, image, createdAt } = session.user;

  return (
    <ProfileForm
      user={{ id, firstName, lastName, email, image, createdAt }}
      s3Enabled={s3Enabled}
    />
  );
}
