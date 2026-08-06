import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { s3Enabled } from "@/lib/storage/config";

import { ProfileForm } from "./profile-form";

export async function Profile() {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id, firstName, lastName, email, image, createdAt } = session.user;

  return (
    <ProfileForm
      user={{ id, firstName, lastName, email, image, createdAt }}
      s3Enabled={s3Enabled}
    />
  );
}
