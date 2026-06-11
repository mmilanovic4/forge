"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

export function SearchInput({ defaultValue = "", limit }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", String(limit));
      if (value) params.set("search", value);
      router.push(`/users?${params.toString()}`);
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
