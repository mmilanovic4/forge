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

const NEW_ACCOUNT_WINDOW_MS = 60 * 60 * 1000;

// Whether the account was created within the last hour — straight after
// sign-up and onboarding, when greeting someone "back" would read oddly.
export function isNewAccount({ createdAt }) {
  return Date.now() - new Date(createdAt).getTime() < NEW_ACCOUNT_WINDOW_MS;
}
