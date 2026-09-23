import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function NativeSelect({ className, children, ...props }) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <select
        data-slot="native-select"
        className="border-input dark:bg-input/30 focus-visible:ring-ring/50 h-8 w-full cursor-pointer appearance-none rounded-lg border bg-transparent py-0 pr-8 pl-2.5 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2"
      />
    </div>
  );
}

export { NativeSelect };
