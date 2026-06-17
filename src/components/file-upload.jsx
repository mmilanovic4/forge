"use client";

import { useRef, useState, useTransition } from "react";

import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadImageAction } from "@/app/actions/upload";
import { cn } from "@/lib/utils";

export function FileUpload({
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  action = uploadImageAction,
  onUploaded,
  disabled,
  className,
  children,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleFile(file) {
    if (!file) return;
    if (file.size > maxSize) {
      toast.error(
        `File is too large (max ${Math.round(maxSize / 1024 / 1024)}MB).`,
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await action(null, formData);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      onUploaded?.(res);
    });
  }

  const busy = pending || disabled;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!busy) handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => !busy && inputRef.current?.click()}
      className={cn(
        "border-input bg-background hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors",
        dragging && "border-ring bg-muted/50",
        busy && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {children ?? (
        <>
          {pending ? (
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          ) : (
            <Upload className="text-muted-foreground size-5" />
          )}
          <p className="text-muted-foreground text-sm">
            {pending ? "Uploading…" : "Click or drag a file here to upload"}
          </p>
        </>
      )}
    </div>
  );
}
