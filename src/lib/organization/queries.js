import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { organizationsEnabled } from "../app-config";
import { db } from "../db";
import { requireSession } from "../session";
import { defaultOrganizationId } from "./lifecycle";
import { can } from "./permissions";

// Everything the pages read about organizations. Each query resolves its own
// caller instead of taking a user or organization id, so none of them can be
// pointed at somebody else's data by the code calling it.

/**
 * The caller's active organization and their membership in it, or `null` when
 * they belong to none or organizations are switched off.
 *
 * The session's activeOrganizationId is only a hint: it can point at an
 * organization the user has since left, been removed from, or that was
 * deleted. Membership is re-checked here, and a stale value is replaced.
 */
export const getActiveOrganization = cache(async () => {
  const session = await requireSession();

  if (!organizationsEnabled) return null;

  const userId = session.user.id;
  const findMember = (organizationId) =>
    organizationId &&
    db.member.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      include: { organization: true },
    });

  let member = await findMember(session.session.activeOrganizationId);

  if (!member) {
    const organizationId = await defaultOrganizationId(userId);
    if (!organizationId) return null;

    member = await findMember(organizationId);
    await db.session.update({
      where: { id: session.session.id },
      data: { activeOrganizationId: organizationId },
    });
  }

  const { organization, ...membership } = member;
  return { organization, member: membership };
});

/**
 * Same as getActiveOrganization, but users without an organization are sent to
 * onboarding — this is the gate that makes membership mandatory for anything
 * organization-scoped. Their own account stays reachable, so it isn't applied
 * to settings.
 */
export async function requireActiveOrganization() {
  const scope = await getActiveOrganization();

  if (organizationsEnabled && !scope) {
    redirect("/onboarding");
  }

  return scope;
}

// The caller's organizations, for the switcher.
export const listUserOrganizations = cache(async () => {
  const session = await requireSession();

  const memberships = await db.member.findMany({
    where: { userId: session.user.id },
    orderBy: { organization: { name: "asc" } },
    select: { organization: { select: { id: true, name: true } } },
  });

  return memberships.map(({ organization }) => organization);
});

const pending = () => ({ status: "pending", expiresAt: { gt: new Date() } });

// Pending, unexpired invitations addressed to the caller. better-auth stores
// emails lowercased.
export const listPendingInvitations = cache(async () => {
  const session = await requireSession();

  return db.invitation.findMany({
    where: { email: session.user.email.toLowerCase(), ...pending() },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      role: true,
      organization: { select: { name: true } },
      inviter: { select: { name: true } },
    },
  });
});

/**
 * One invitation by id, or `null` once it has expired, been cancelled or been
 * used. Needs no session: the invitation page also greets people who have no
 * account yet, and the id — an unguessable random string — is the credential.
 */
export async function getPendingInvitation(id) {
  return db.invitation.findFirst({
    where: { id, ...pending() },
    select: {
      email: true,
      role: true,
      organization: { select: { name: true } },
      inviter: { select: { name: true } },
    },
  });
}

// Everyone in the active organization, longest-standing first.
export async function listMembers() {
  const { organization } = await requireActiveOrganization();

  return db.member.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "asc" },
    // Every other member can read this, so only what the list shows.
    select: {
      id: true,
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Pending invitations to the active organization. Their ids work as
 * invitation links, so only members who could send one get to see them —
 * everyone else gets an empty list.
 */
export async function listInvitations() {
  const { organization, member } = await requireActiveOrganization();

  if (!can(member.role, "invitation", "create")) return [];

  return db.invitation.findMany({
    where: { organizationId: organization.id, ...pending() },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, expiresAt: true },
  });
}

// How many members the active organization has, and how many of them are
// owners — enough to tell whether the caller may leave it.
export async function countMembers() {
  const { organization } = await requireActiveOrganization();
  const organizationId = organization.id;

  const [members, owners] = await Promise.all([
    db.member.count({ where: { organizationId } }),
    db.member.count({ where: { organizationId, role: "owner" } }),
  ]);

  return { members, owners };
}

export async function getOrganizationStats() {
  const { organization } = await requireActiveOrganization();

  const organizationId = organization.id;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, activeSessions, recent] = await Promise.all([
    db.member.count({ where: { organizationId } }),
    // Sessions working in this organization right now. The membership check
    // drops ones left pointing here by someone who has since been removed.
    db.session.count({
      where: {
        expiresAt: { gt: now },
        activeOrganizationId: organizationId,
        user: { members: { some: { organizationId } } },
      },
    }),
    db.member.count({
      where: { organizationId, createdAt: { gte: weekAgo } },
    }),
  ]);

  return { total, activeSessions, recent };
}
