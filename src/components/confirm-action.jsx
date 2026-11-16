"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Asks before an action runs. Either wraps the button that triggers it:
 *
 *   <ConfirmAction title="Remove member?" confirmLabel="Remove" onConfirm={…}>
 *     <Button variant="ghost">Remove</Button>
 *   </ConfirmAction>
 *
 * or, with no children, is opened from outside through `open` and
 * `onOpenChange` — which is what a dropdown menu item needs, since the menu
 * unmounts a trigger rendered inside it as soon as it closes.
 *
 * `variant` styles the confirm button; pass "default" when the action isn't
 * destructive.
 */
export function ConfirmAction({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  open,
  onOpenChange,
  children,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
