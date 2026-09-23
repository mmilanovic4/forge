export const appName = "Forge";

export const cookiePrefix = "auth";

// Opt-in multi-tenancy. Public so the auth client and client components can
// read it too; when on, every signed-in user must belong to an organization.
export const organizationsEnabled =
  process.env.NEXT_PUBLIC_ORGANIZATIONS === "true";
