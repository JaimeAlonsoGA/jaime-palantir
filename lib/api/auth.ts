// The whole /api is private: every request needs `Authorization: Bearer $PORTFOLIO_API_TOKEN`.
// Runs in middleware (edge runtime), so no node:crypto; the comparison is constant-time by hand.

function sameSecret(actual: string, expected: string) {
  let difference = actual.length ^ expected.length;
  for (let index = 0; index < expected.length; index++) {
    difference |= (actual.charCodeAt(index) || 0) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function deny(code: string, message: string, status: number) {
  return Response.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store", "WWW-Authenticate": 'Bearer realm="portfolio"' } },
  );
}

/** null when the request may pass; otherwise the response to send instead. */
export function authorize(request: Request): Response | null {
  const token = process.env.PORTFOLIO_API_TOKEN;
  if (!token) return deny("api_disabled", "The API is off: PORTFOLIO_API_TOKEN is not set.", 503);
  const header = request.headers.get("authorization") ?? "";
  if (!sameSecret(header, `Bearer ${token}`)) {
    return deny("unauthorized", "Send Authorization: Bearer <PORTFOLIO_API_TOKEN>.", 401);
  }
  return null;
}
