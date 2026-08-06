export const appName = "Forge";

// Namespaces every auth cookie: `<prefix>.session_token`, `<prefix>.two_factor`
// and so on. Kept here rather than in auth.js so the proxy can match on it
// without importing the server-only auth config.
//
// Deliberately not derived from appName: changing this logs every user out, so
// renaming the app must not silently invalidate its sessions. Treat it as
// frozen once deployed.
export const cookiePrefix = "auth";
