import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AuthResult =
  | { ok: true; userId: string; email?: string }
  | { ok: false; response: Response };

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, prefer, accept, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const encoded = token.split(".")[1];
  if (!encoded) return null;

  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function deriveGuestUserId(req: Request): Promise<string> {
  const sharedId = Deno.env.get("APP_SHARED_USER_ID")?.trim();
  if (sharedId) return sharedId;

  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const realIp = req.headers.get("x-real-ip")?.trim() ?? "";
  const cfIp = req.headers.get("cf-connecting-ip")?.trim() ?? "";
  const userAgent = req.headers.get("user-agent")?.trim() ?? "";
  const origin = req.headers.get("origin")?.trim() ?? "";
  const projectSeed = Deno.env.get("SUPABASE_URL")?.trim() ?? "lovable-cloud";
  const fingerprint = [projectSeed, cfIp || realIp || forwardedFor || "guest", userAgent || "browser", origin || "origin"].join("|");
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprint)));
  const bytes = digest.slice(0, 16);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Prefer a real signed-in user when present. If the client is running in guest/local mode,
 * fall back to a deterministic UUID so user-scoped tables still work without a shared secret.
 */
export async function requireAuthUser(
  req: Request,
  anonKey: string,
  supabaseUrl: string,
): Promise<AuthResult> {
  const token = getBearerToken(req);
  const payload = token ? decodeJwtPayload(token) : null;

  if (token && payload?.role === "authenticated") {
    try {
      const sb = createClient(supabaseUrl, anonKey);
      const { data, error } = await sb.auth.getUser(token);
      if (!error && data.user) {
        return {
          ok: true,
          userId: data.user.id,
          email: data.user.email ?? undefined,
        };
      }
    } catch (error) {
      console.warn("requireAuthUser: failed to validate user token", error);
    }

    return {
      ok: false,
      response: jsonResponse(401, { error: "Your session is no longer valid. Please sign in again." }),
    };
  }

  return { ok: true, userId: await deriveGuestUserId(req), email: undefined };
}

/**
 * Open-source build: no per-request credit debits. (Stub kept so call sites stay stable.)
 * Always returns null = proceed with the Edge Function handler.
 */
export async function debitCreditsOrResponse(
  _sb: unknown,
  _userId: string,
  _amountUsd: number,
  _reason: string,
  _corsHeaders: Record<string, string>,
  _userEmail?: string,
): Promise<Response | null> {
  return null;
}
