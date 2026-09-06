/**
 * Initials for an avatar fallback.
 *
 * Built from firstName/lastName rather than by splitting `name`, which is a
 * heuristic that mangles middle names and surname-first orders. OAuth sign-ups
 * don't always give us those fields though (GitHub never does), so fall back to
 * a single letter from `name` before rendering an empty avatar.
 */
export function getInitials({ firstName, lastName, name } = {}) {
  const fromFields = `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  return (fromFields || name?.[0] || "").toUpperCase();
}
