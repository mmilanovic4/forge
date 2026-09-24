"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH } from "@/lib/app-config";

export function PasswordInput({ ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className="pr-10" {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        onClick={() => setShow(!show)}
      >
        {show ? (
          <EyeOff className="text-muted-foreground h-4 w-4" />
        ) : (
          <Eye className="text-muted-foreground h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// Pair with `aria-describedby={id}` on the input it describes.
export function PasswordHint({ id }) {
  return (
    <p id={id} className="text-muted-foreground text-xs">
      At least {MIN_PASSWORD_LENGTH} characters.
    </p>
  );
}
