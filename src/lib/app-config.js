export const appName = "Forge";

// Namespaces every auth cookie. Kept here rather than in auth.js so the proxy
// can match on it without importing the server-only auth config.
export const cookiePrefix = "forge";
