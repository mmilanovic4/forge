"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

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
import { authClient } from "@/lib/auth-client";

export function UserActions({ user, currentUserId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [removeAdminDialogOpen, setRemoveAdminDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isSelf = user.id === currentUserId;

  async function handleBan() {
    setLoading(true);
    const { error } = await authClient.admin.banUser({ userId: user.id });
    if (error) {
      toast.error(error.message ?? "Something went wrong.");
    } else {
      toast.success("User banned.");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleUnban() {
    setLoading(true);
    const { error } = await authClient.admin.unbanUser({ userId: user.id });
    if (error) {
      toast.error(error.message ?? "Something went wrong.");
    } else {
      toast.success("User unbanned.");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleSetRole(role) {
    setLoading(true);
    const { error } = await authClient.admin.setRole({ userId: user.id, role });
    if (error) {
      toast.error(error.message ?? "Something went wrong.");
    } else {
      toast.success(`Role set to ${role}.`);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const { error } = await authClient.admin.removeUser({ userId: user.id });
    if (error) {
      toast.error(error.message ?? "Something went wrong.");
    } else {
      toast.success("User deleted.");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={loading}
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
              {user.role === "admin" ? (
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
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBan}
            >
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
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
