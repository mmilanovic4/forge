"use client";

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

export function UserMenu({ user: { firstName, lastName, email, image } }) {
  const router = useRouter();

  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          {image && <AvatarImage src={image} alt={initials} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">
            {firstName} {lastName}
          </p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push("/users")}
        >
          <Users className="mr-2 h-4 w-4" />
          Users
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push("/settings/profile")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
