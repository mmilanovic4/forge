export const appName = "Forge";

export const cookiePrefix = "auth";

// Opt-in multi-tenancy. Public so the auth client and client components can
// read it too; when on, every signed-in user must belong to an organization.
export const organizationsEnabled =
  process.env.NEXT_PUBLIC_ORGANIZATIONS === "true";

// Also public: the login and register forms change shape with it.
export const authMethod = process.env.NEXT_PUBLIC_AUTH_METHOD;

// Code and link modes sign in by email alone. A password then never logs
// anyone in — and neither does two-factor, which only guards password sign-in.
export const passwordLogin =
  authMethod !== "otp" && authMethod !== "magic-link";

// Passed to better-auth too, so the forms' hint and the server's check agree.
export const MIN_PASSWORD_LENGTH = 8;
