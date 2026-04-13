import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AuthResult =
  | { ok: true; userId: string; email?: string }
  | { ok: false; response: Response };

export async function requireAuthUser(req: Request, anonKey: string, supabaseUrl: string): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }),
    };
  }
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }),
    };
  }
  return { ok: true, userId: user.id, email: user.email };
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
