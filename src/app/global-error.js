"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/error-fallback";
import { appName } from "@/lib/app-config";

import "./globals.css";

// Only for errors in the root layout itself. It replaces that layout, so it
// brings its own document, styles and theme; metadata exports aren't
// supported here, hence the <title>.
export default function GlobalError({ error, retry }) {
  // next-themes' provider injects a <script>, which React won't run in a
  // client-rendered tree like this one — so apply the saved theme directly.
  useEffect(() => {
    let theme = "system";
    try {
      theme = localStorage.getItem("theme") ?? "system";
    } catch {}
    const dark =
      theme === "dark" ||
      (theme === "system" &&
        matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <title>{`Something went wrong | ${appName}`}</title>
        <ErrorFallback error={error} retry={retry} />
      </body>
    </html>
  );
}
