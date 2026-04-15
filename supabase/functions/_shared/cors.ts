/**
 * Edge Functions: browsers send Access-Control-Request-Headers on preflight.
 * Echoing that value avoids "preflight doesn't have HTTP ok" when Allow-Headers is too narrow.
 */
export function corsHeadersForRequest(req: Request): Record<string, string> {
  const requested = req.headers.get("Access-Control-Request-Headers");
  const allowHeaders =
    requested ??
    [
      "authorization",
      "x-client-info",
      "apikey",
      "content-type",
      "prefer",
      "accept",
      "origin",
      "x-requested-with",
      "x-sb-edge",
      "x-supabase-client-platform",
      "x-supabase-client-platform-version",
      "x-supabase-client-runtime",
      "x-supabase-client-runtime-version",
    ].join(", ");

  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": allowHeaders,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}
