"use client";
import { useAppContext } from "./app-provider";

export function Footer() {
  const { appName } = useAppContext();
  return (
    <footer className="mt-auto border-t p-4 text-center">
      <p className="text-muted-foreground text-xs">
        &copy; {appName}, {new Date().getFullYear()}.
      </p>
    </footer>
  );
}
