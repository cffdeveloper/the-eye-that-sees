import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AuthResult =
  | { ok: true; userId: string }
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
  return { ok: true, userId: user.id };
}

export async function debitCreditsOrResponse(
  sb: SupabaseClient,
  userId: string,
  amountUsd: number,
  reason: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const { data, error } = await sb.rpc("consume_user_credits", {
    p_user_id: userId,
    p_amount: amountUsd,
    p_reason: reason,
  });
  if (error) {
    console.error("consume_user_credits:", error);
    return new Response(JSON.stringify({ error: "Could not verify credit balance" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const ok = data?.ok === true;
  if (!ok) {
    return new Response(
      JSON.stringify({
        error: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        balance: data?.balance ?? 0,
      }),
      {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  return null;
}
