"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/use-action";
import { authClient } from "@/lib/auth-client";
import { slugify } from "@/lib/utils";

const randomTail = () => Math.random().toString(36).slice(2, 8);

// better-auth wants a unique slug for every organization. Nothing in the app
// shows or routes by one, so it is derived from the name instead of asked for;
// a second organization of the same name gets a random tail. Names that leave
// nothing to derive from (no Latin letters or digits) fall back to a generic
// base.
async function createOrganization(name) {
  const slug = slugify(name) || "organization";

  const result = await authClient.organization.create({ name, slug });
  if (result.error?.code !== "ORGANIZATION_ALREADY_EXISTS") return result;

  return authClient.organization.create({
    name,
    slug: `${slug}-${randomTail()}`,
  });
}

/**
 * The one field it takes to start an organization. The new organization
 * becomes the active one and the creator its owner, and they land on its
 * dashboard.
 */
export function CreateOrganizationForm({ autoFocus = false }) {
  const { pending, run } = useAction();
  const [name, setName] = useState("");

  const trimmed = name.trim();

  function handleSubmit(e) {
    e.preventDefault();
    run("create", () => createOrganization(trimmed), {
      redirectTo: "/dashboard",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="organization-name">Name</Label>
        <Input
          autoFocus={autoFocus}
          id="organization-name"
          name="name"
          placeholder="Acme Inc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={pending !== null || !trimmed}
      >
        {pending === "create" ? "Creating..." : "Create organization"}
      </Button>
    </form>
  );
}
