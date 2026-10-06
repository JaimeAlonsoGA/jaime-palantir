import { NextResponse } from "next/server";
import { authorize } from "@/lib/api/auth";

// The API's front door and its spec are public, so an agent can find out how to use it.
// Everything else, reads included, needs the token.
const open = new Set(["/api/v1", "/api/v1/openapi.json"]);

export function middleware(request: Request) {
  const { pathname } = new URL(request.url);
  if (request.method === "GET" && open.has(pathname.replace(/\/$/, ""))) return NextResponse.next();
  return authorize(request) ?? NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
