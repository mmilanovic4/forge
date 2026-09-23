"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

export function SearchInput({ defaultValue = "", limit }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const timer = useRef(null);

  // Driven by the keystroke rather than an effect on `value`: an effect also
  // fires on mount — twice under StrictMode, which slipped past a first-render
  // guard and reset ?page= to 1 on every visit.
  function handleChange(e) {
    const next = e.target.value;
    setValue(next);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // Start from the current query so params we don't own (future sort,
      // filters, …) survive a search.
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      // `limit` is the value the server already validated, so a bogus one in
      // the URL gets normalised away rather than carried along.
      params.set("limit", String(limit));
      if (next) params.set("search", next);
      else params.delete("search");
      // replace(): a debounced keystroke shouldn't be its own history entry.
      router.replace(`/users?${params.toString()}`, { scroll: false });
    }, 300);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Input
      placeholder="Search by name..."
      value={value}
      onChange={handleChange}
      className="w-full sm:w-64"
    />
  );
}
