import { NextResponse } from "next/server";
import { authorize } from "@/lib/api/auth";

// One gate for the whole private API, so no route can forget to check.
export function middleware(request: Request) {
  return authorize(request) ?? NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
