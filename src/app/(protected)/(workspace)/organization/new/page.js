import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateOrganizationForm } from "@/components/create-organization-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { organizationsEnabled } from "@/lib/app-config";

export const metadata = {
  title: "New organization",
};

// Another organization for someone who already has one — reached from the
// switcher. A first organization is created on /onboarding instead.
export default function NewOrganization() {
  if (!organizationsEnabled) notFound();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>New organization</CardTitle>
          <CardDescription>
            You will be its owner, and can invite people as soon as it exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm autoFocus />
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/dashboard"
            className="text-muted-foreground text-sm hover:underline"
          >
            Cancel
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
