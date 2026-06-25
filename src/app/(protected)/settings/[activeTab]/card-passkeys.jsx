"use client";

import { useState } from "react";

import { KeyRound } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@/hooks/use-form";
import { authClient } from "@/lib/auth-client";

export function Passkeys() {
  const { data: passkeys, isPending } = authClient.useListPasskeys();
  const [adding, setAdding] = useState(false);
  const { values, handleChange, setValues } = useForm({ name: "" });

  async function handleAdd() {
    setAdding(true);

    const { error } = await authClient.passkey.addPasskey({
      name: values.name || undefined,
    });

    setAdding(false);
    setValues({ name: "" });

    if (error) {
      if (error.code !== "REGISTRATION_CANCELLED") {
        toast.error(error.message ?? "Something went wrong. Please try again.");
      }
      return;
    }

    toast.success("Passkey added.");
  }

  async function handleRemove(passkey) {
    const { error } = await authClient.passkey.deletePasskey({
      id: passkey.id,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    toast.success("Passkey removed.");
  }

  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
        <CardDescription>
          Sign in with a fingerprint, face scan or security key instead of a
          password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : passkeys?.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <KeyRound className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {passkey.name || "Unnamed passkey"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Added{" "}
                      {new Date(passkey.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleRemove(passkey)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No passkeys yet.</p>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Add a passkey
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add a passkey</AlertDialogTitle>
              <AlertDialogDescription>
                Give it a name so you can recognize it later, then follow your
                {" browser's"} prompt to register it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 px-1 pb-2">
              <Label htmlFor="passkey-name">Name</Label>
              <Input
                id="passkey-name"
                name="name"
                placeholder="e.g. MacBook Touch ID"
                value={values.name}
                onChange={handleChange}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setValues({ name: "" })}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction disabled={adding} onClick={handleAdd}>
                {adding ? "Adding..." : "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
