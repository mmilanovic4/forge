"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LogOut, Settings, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/user";

// `onboarding` hides the links to protected pages, which would only bounce a
// user without an organization back to onboarding.
export function UserMenu({
  user: { name, firstName, lastName, email, image },
  onboarding = false,
}) {
  const router = useRouter();

  const initials = getInitials({ firstName, lastName, name });

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* A real button, so the menu opens from the keyboard too. */}
        <button
          type="button"
          aria-label="Account menu"
          className="focus-visible:ring-ring/50 cursor-pointer rounded-full outline-none focus-visible:ring-[3px]"
        >
          <Avatar>
            {image && <AvatarImage src={image} alt="" />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>
        {!onboarding && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings/profile">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
