// Who may do what inside an organization. Importable from client components:
// the UI uses it to decide what to show, while the server enforces the same
// rules on every call — these only keep the two from disagreeing.
import { defaultRoles } from "better-auth/plugins/organization/access";

// The roles the organization plugin ships with, most privileged first.
export const ORGANIZATION_ROLES = ["owner", "admin", "member"];

const OWNER = "owner";

/**
 * Whether `role` holds a permission, read from the plugin's own role
 * definitions rather than restated here:
 *
 *   can(role, "invitation", "create")
 *   can(role, "organization", "delete")
 */
export const can = (role, resource, action) =>
  !!defaultRoles[role]?.authorize({ [resource]: [action] }).success;

/**
 * Whether someone with `actorRole` may change the role of ("update") or remove
 * ("delete") a member holding `targetRole`. On top of the permission itself,
 * only an owner may touch another owner.
 */
export const canManageMember = (actorRole, targetRole, action) =>
  can(actorRole, "member", action) &&
  (actorRole === OWNER || targetRole !== OWNER);

// Roles `actorRole` may hand out, by invitation or by changing a member's
// role. Only an owner may make another owner.
export const assignableRoles = (actorRole) =>
  actorRole === OWNER
    ? ORGANIZATION_ROLES
    : ORGANIZATION_ROLES.filter((role) => role !== OWNER);

export const isOwner = (role) => role === OWNER;
