import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAILS = ["intelgoldmine@gmail.com"];

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
 * Debit credits from a user. Admin emails bypass deduction entirely.
 * Returns null on success, or a Response to send back on failure.
 *
 * IMPORTANT: On insufficient credits we return status 200 with
 * `{ error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" }`
 * so the browser does NOT log a red "Failed to load resource" line.
 */
export async function debitCreditsOrResponse(
  sb: any,
  userId: string,
  amountUsd: number,
  reason: string,
  corsHeaders: Record<string, string>,
  userEmail?: string,
): Promise<Response | null> {
  // Admin bypass — never debit
  if (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
    return null;
  }

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
    // Return 200 with a code so the browser doesn't log a red error
    return new Response(
      JSON.stringify({
        error: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        balance: data?.balance ?? 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  return null;
}
