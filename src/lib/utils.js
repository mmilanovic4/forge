import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// URL-safe identifier from free text. `trim: false` keeps a trailing dash so a
// slug can be typed by hand without the separator vanishing mid-word.
export function slugify(text, { trim = true } = {}) {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    // "Alice's workspace" → "alices-workspace", not "alice-s-workspace".
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 48);
  return trim ? slug.replace(/-+$/, "") : slug;
}

// Only same-origin paths — a `?redirect=` value is attacker-controlled, and
// `//evil.com` or `/\evil.com` would leave the site.
export function safeRedirect(value, fallback = "/dashboard") {
  return typeof value === "string" && /^\/(?![/\\])/.test(value)
    ? value
    : fallback;
}
