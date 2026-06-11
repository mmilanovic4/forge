import { NextResponse } from "next/server";

export function GET(request) {
  const error = new URL(request.url).searchParams.get("error");
  const url = new URL("/auth-error", request.url);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}
