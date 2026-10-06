import { ZodError } from "zod";
import { apiSource, StaleWrite, withSource } from "../content/source";
import { ContentError } from "../content/store";

// Private API (see middleware.ts): every response is per-request and never cached.

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function error(code: string, message: string, status: number, details?: unknown) {
  return json({ error: { code, message, ...(details ? { details } : {}) } }, status);
}

/**
 * Runs an API handler against the API's storage (GitHub in production, disk locally) and turns
 * content errors into JSON. A write in production answers with the commit it made.
 */
export async function guard(task: () => Promise<Response>) {
  const store = apiSource();
  try {
    const response = await withSource(store, task);
    if (store.lastCommit) {
      response.headers.set("X-Portfolio-Commit", store.lastCommit);
      response.headers.set("X-Portfolio-Live", "after the Vercel deploy of this commit, about a minute");
    }
    return response;
  } catch (reason) {
    if (reason instanceof ContentError) {
      const status = reason.code === "not_found" ? 404 : reason.code === "conflict" ? 409 : 422;
      return error(reason.code, reason.message, status);
    }
    if (reason instanceof StaleWrite) {
      return error("conflict", "The portfolio changed while this request ran. Nothing was written; send it again.", 409);
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
