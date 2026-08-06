import { AuthErrorCard } from "./auth-error-card";

export const metadata = {
  title: "Auth error",
};

export default async function AuthError({ searchParams }) {
  const { error } = await searchParams;
  return <AuthErrorCard error={error} />;
}
