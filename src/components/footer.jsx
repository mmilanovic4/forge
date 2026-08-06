import { appName } from "@/lib/app-config";

export function Footer() {
  return (
    <footer className="mt-auto border-t p-4 text-center">
      <p className="text-muted-foreground text-xs">
        &copy; {appName}, {new Date().getFullYear()}.
      </p>
    </footer>
  );
}
