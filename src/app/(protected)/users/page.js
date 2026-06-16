import { headers } from "next/headers";
import { use } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { listAllUsers } from "@/lib/data-helper";

import { SearchInput } from "./search-input";
import { UserActions } from "./user-actions";

const LIMIT_OPTIONS = [10, 20, 50];
const DEFAULT_LIMIT = 10;

function buildUrl(page, limit, search) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  return `/users?${params.toString()}`;
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function Highlight({ text, query }) {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-yellow-200 px-0 dark:bg-yellow-800">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

async function UsersTable({ page, limit, search }) {
  const hdrs = await headers();

  const [session, usersData] = await Promise.all([
    auth.api.getSession({ headers: hdrs }),
    listAllUsers({ search, limit, offset: (page - 1) * limit }),
  ]);

  const isAdmin = session?.user?.role === "admin";
  const currentUserId = session?.user?.id;

  const users = usersData?.users ?? [];
  const total = usersData?.total ?? 0;

  const totalPages = Math.ceil(total / limit);
  const safePage = Math.min(page, totalPages || 1);
  const pageNumbers = getPageNumbers(safePage, totalPages);
  const skip = (page - 1) * limit;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <SearchInput defaultValue={search} limit={limit} />
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>Rows per page</span>
            <div className="flex gap-1">
              {LIMIT_OPTIONS.map((opt) => (
                <PaginationLink
                  key={opt}
                  href={buildUrl(1, opt, search)}
                  isActive={opt === limit}
                  size="sm"
                >
                  {opt}
                </PaginationLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>2FA</TableHead>
            <TableHead>Joined</TableHead>
            {isAdmin && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isAdmin ? 7 : 6}
                className="text-muted-foreground py-8 text-center"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const initials =
                `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        <Highlight text={user.firstName} query={search} />{" "}
                        <Highlight text={user.lastName} query={search} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role ?? "user"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.banned ? "destructive" : "outline"}>
                      {user.banned ? "Banned" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.twoFactorEnabled ? "default" : "outline"}
                    >
                      {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <UserActions user={user} currentUserId={currentUserId} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {skip + 1}–{Math.min(skip + limit, total)} of {total} users
          </p>
          <Pagination className="w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildUrl(safePage - 1, limit, search)}
                  aria-disabled={safePage === 1}
                  className={
                    safePage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {pageNumbers.map((n, i) =>
                n === "..." ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={n}>
                    <PaginationLink
                      href={buildUrl(n, limit, search)}
                      isActive={n === safePage}
                    >
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href={buildUrl(safePage + 1, limit, search)}
                  aria-disabled={safePage === totalPages}
                  className={
                    safePage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "Users",
};

export default function Users({ searchParams }) {
  const { page: pageParam, limit: limitParam, search } = use(searchParams);

  const limit = LIMIT_OPTIONS.includes(Number(limitParam))
    ? Number(limitParam)
    : DEFAULT_LIMIT;
  const page = Math.max(1, Number(pageParam) || 1);

  return <UsersTable page={page} limit={limit} search={search ?? ""} />;
}
