// The roles the organization plugin ships with, most privileged first. Kept
// out of lib/organization.js so client components can import it.
export const ORGANIZATION_ROLES = ["owner", "admin", "member"];

export const canManageOrganization = (role) =>
  role === "owner" || role === "admin";
