import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-6xl font-semibold tracking-tight">404</h1>
        <p className="text-muted-foreground">This page could not be found.</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
