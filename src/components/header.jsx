import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

import { Logo } from "./logo";

// `context` sits next to the logo and says where the user is working — the
// organization switcher; `children` are the controls on the right.
export function Header({ context, children }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          >
            <Logo />
          </Link>
          {context && (
            <>
              <span
                className="text-muted-foreground/40 pl-2 text-lg select-none"
                aria-hidden
              >
                /
              </span>
              {context}
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {children}
        </div>
      </div>
    </header>
  );
}
