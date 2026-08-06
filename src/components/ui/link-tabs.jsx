import Link from "next/link";

import {
  tabsListVariants,
  tabsTriggerClasses,
} from "@/components/ui/tabs-variants";
import { cn } from "@/lib/utils";

/**
 * Navigation-driven tabs. Visually identical to the Radix `Tabs`, but each tab
 * is a real link, so the active tab comes from the URL and the whole thing can
 * render on the server.
 *
 * @param {{ value: string, href: string, label: string, icon?: React.ElementType }[]} tabs
 */
export function LinkTabs({ tabs, activeTab, variant = "default", className }) {
  return (
    <nav
      data-slot="tabs"
      data-orientation="horizontal"
      className={cn("group/tabs flex flex-col gap-2", className)}
    >
      <div
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), "w-full")}
      >
        {tabs.map(({ value, href, label, icon: Icon }) => {
          const isActive = value === activeTab;
          return (
            <Link
              key={value}
              href={href}
              data-slot="tabs-trigger"
              data-active={isActive || undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(...tabsTriggerClasses, "flex-1")}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
