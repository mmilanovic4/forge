import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

import { Logo } from "./logo";

export function Header({ children }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {children}
        </div>
      </div>
    </header>
  );
}
