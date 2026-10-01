import { ZodError } from "zod";
import { ContentError } from "../content/store";

// Private API (see middleware.ts): every response is per-request and never cached.

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function error(code: string, message: string, status: number, details?: unknown) {
  return json({ error: { code, message, ...(details ? { details } : {}) } }, status);
}

export async function guard(task: () => Promise<Response>) {
  try {
    return await task();
  } catch (reason) {
    if (reason instanceof ContentError) {
      const status = reason.code === "not_found" ? 404 : reason.code === "conflict" ? 409 : 422;
      return error(reason.code, reason.message, status);
    }
    if (reason instanceof ZodError) {
      return error("validation", "The payload does not match the portfolio schema.", 422, reason.issues);
    }
    console.error(reason);
    return error("internal", "Unexpected error", 500);
  }
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ContentError("validation", "Body must be JSON");
  }
}

/** `?include=all` adds drafts and archived projects. */
export function includeAll(request: Request) {
  return new URL(request.url).searchParams.get("include") === "all";
}
