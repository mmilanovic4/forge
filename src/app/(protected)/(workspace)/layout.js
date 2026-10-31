import { requireActiveOrganization } from "@/lib/session";

// Pages that work inside an organization. Gated here rather than only by their
// queries, which can run inside a Suspense boundary after streaming has started.
export default async function WorkspaceLayout({ children }) {
  await requireActiveOrganization();

  return children;
}
