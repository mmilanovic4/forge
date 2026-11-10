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
    // "Alice's team" → "alices-team", not "alice-s-team".
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 48);
  return trim ? slug.replace(/-+$/, "") : slug;
}

// Never resolved for real — only there so a relative value has something to
// be parsed against, and a host it must not leave.
const REDIRECT_BASE = "http://redirect.invalid";

// Only same-origin paths — a `?redirect=` value is attacker-controlled.
// Parsed the way a browser will rather than pattern-matched: URL parsing drops
// tabs and newlines and reads `\` as `/`, so `/\t/evil.com` and `/\evil.com`
// both mean `//evil.com` and would leave the site. What comes back is the
// parsed form, so it is exactly what the caller ends up navigating to.
export function safeRedirect(value, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;

  let url;
  try {
    url = new URL(value, REDIRECT_BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== REDIRECT_BASE) return fallback;

  const path = `${url.pathname}${url.search}${url.hash}`;
  // `/.//evil.com` stays on the host while parsing, but its path normalises
  // to `//evil.com` — which the next navigation would read as a host.
  return path.startsWith("//") ? fallback : path;
}
