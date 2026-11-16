"use client";

import { useState } from "react";

import { MoreHorizontal } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAction } from "@/hooks/use-action";
import { authClient } from "@/lib/auth-client";
import { isAdmin } from "@/lib/user";

export function UserActions({ user, currentUserId }) {
  const { pending, run } = useAction();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [removeAdminDialogOpen, setRemoveAdminDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isSelf = user.id === currentUserId;
  const userId = user.id;

  const handleBan = () =>
    run("ban", () => authClient.admin.banUser({ userId }), {
      success: "User banned.",
    });

  const handleUnban = () =>
    run("unban", () => authClient.admin.unbanUser({ userId }), {
      success: "User unbanned.",
    });

  const handleSetRole = (role) =>
    run("role", () => authClient.admin.setRole({ userId, role }), {
      success: `Role set to ${role}.`,
    });

  const handleDelete = () =>
    run("delete", () => authClient.admin.removeUser({ userId }), {
      success: "User deleted.",
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={pending !== null}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user.banned ? (
            <>
              <DropdownMenuItem onClick={handleUnban}>Unban</DropdownMenuItem>
              <DropdownMenuItem
                disabled={isSelf}
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {isAdmin(user) ? (
                <DropdownMenuItem
                  onClick={() => setRemoveAdminDialogOpen(true)}
                >
                  Remove admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleSetRole("admin")}>
                  Make admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={isSelf}
                onClick={() => setBanDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                Ban
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isSelf}
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent the user from signing in. You can unban them at
              any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleBan}>
              Ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={removeAdminDialogOpen}
        onOpenChange={setRemoveAdminDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the user&apos;s admin privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSetRole("user")}>
              Remove admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user&apos;s account and all
              associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
