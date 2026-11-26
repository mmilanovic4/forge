"use client";

import Link from "next/link";

import {
  Check,
  ChevronsUpDown,
  Mail,
  Plus,
  Settings,
  Users,
} from "lucide-react";

import { OrganizationAvatar } from "@/components/organization-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAction } from "@/hooks/use-action";
import { authClient } from "@/lib/auth-client";
import { invitationPath } from "@/lib/organization/invitation";

/**
 * Names the organization everything on the page belongs to, and is the way to
 * everything about organizations: the active one's pages, switching to
 * another, starting a new one, and invitations waiting for an answer.
 *
 * @param {{ id: string, name: string, role: string }} active
 * @param {{ id: string, name: string }[]} organizations
 * @param {{ id: string, organization: { name: string }, inviter: { name: string } }[]} invitations
 */
export function OrganizationSwitcher({ active, organizations, invitations }) {
  const { pending, run } = useAction();

  function handleSelect(organizationId) {
    if (organizationId === active.id) return;
    run("switch", () => authClient.organization.setActive({ organizationId }));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 max-w-44 min-w-0 gap-2 pl-1.25 sm:max-w-64"
          disabled={pending !== null}
          aria-label={`Organization menu, current: ${active.name}`}
        >
          {/* 20px in the 32px button (1px border included) leaves an even
              6px around the circle. */}
          <OrganizationAvatar
            name={active.name}
            className="data-[size=sm]:size-5"
          />
          <span className="truncate">{active.name}</span>
          {invitations.length > 0 && (
            <span
              className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full"
              aria-hidden
            />
          )}
          <ChevronsUpDown
            className="text-muted-foreground h-3 w-3 shrink-0"
            aria-hidden
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <OrganizationAvatar name={active.name} size="default" />
          <div className="min-w-0">
            <p className="truncate">{active.name}</p>
            <p className="text-muted-foreground text-xs font-normal capitalize">
              {active.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/organization/members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/organization/settings">
            <Settings className="mr-2 h-4 w-4" />
            Organization settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Switch organization
        </DropdownMenuLabel>
        {organizations.map((org) => (
          <DropdownMenuItem key={org.id} onClick={() => handleSelect(org.id)}>
            <OrganizationAvatar name={org.name} />
            <span className="flex-1 truncate">{org.name}</span>
            {org.id === active.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link href="/organization/new">
            <Plus className="mr-2 h-4 w-4" />
            New organization
          </Link>
        </DropdownMenuItem>

        {invitations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Invitations
            </DropdownMenuLabel>
            {invitations.map(({ id, organization, inviter }) => (
              <DropdownMenuItem key={id} asChild>
                <Link href={invitationPath(id)}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{organization.name}</span>
                    <span className="text-muted-foreground block truncate text-xs">
                      Invited by {inviter.name}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
