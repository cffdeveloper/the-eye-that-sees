import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AuthResult =
  | { ok: true; userId: string; email?: string }
  | { ok: false; response: Response };

/**
 * No end-user JWT: all app traffic uses one shared Supabase user id.
 * Set Edge Function secret `APP_SHARED_USER_ID` to a real `auth.users.id` (Dashboard → Authentication → Users).
 */
export async function requireAuthUser(
  _req: Request,
  _anonKey: string,
  _supabaseUrl: string,
): Promise<AuthResult> {
  const id = Deno.env.get("APP_SHARED_USER_ID")?.trim();
  if (!id) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          error:
            "Set Edge Function secret APP_SHARED_USER_ID to a valid auth.users UUID (Supabase Dashboard → Authentication → Users).",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers":
              "authorization, x-client-info, apikey, content-type, prefer, accept, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          },
        },
      ),
    };
  }
  return { ok: true, userId: id, email: undefined };
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
