"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

export function SearchInput({ defaultValue = "", limit }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      // Start from the current query so params we don't own (future sort,
      // filters, …) survive a search.
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      // `limit` is the value the server already validated, so a bogus one in
      // the URL gets normalised away rather than carried along.
      params.set("limit", String(limit));
      if (value) params.set("search", value);
      else params.delete("search");
      // replace(): a debounced keystroke shouldn't be its own history entry.
      router.replace(`/users?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Input
      placeholder="Search by name..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full sm:w-64"
    />
  );
}
