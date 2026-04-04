import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CREDIT_PAYOUT_RATIO, creditsFromPayment } from "../_shared/creditsConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LEGACY_SUB_AMOUNT_CENTS = 3000;

function metaKind(data: any): string | undefined {
  const m = data?.metadata;
  if (!m) return undefined;
  if (typeof m.kind === "string") return m.kind;
  const cf = m.custom_fields as { variable_name?: string; value?: string }[] | undefined;
  const row = cf?.find((f) => f.variable_name === "kind");
  return row?.value;
}

function metaUserId(data: any): string | undefined {
  const m = data?.metadata;
  if (m?.user_id) return String(m.user_id);
  const cf = m?.custom_fields as { variable_name?: string; value?: string }[] | undefined;
  return cf?.find((f) => f.variable_name === "user_id")?.value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reference } = await req.json();

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      return new Response(
        JSON.stringify({ verified: false, status: verifyData.data?.status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = verifyData.data;
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const metaUid = metaUserId(data);
    if (metaUid && metaUid !== user.id) {
      return new Response(JSON.stringify({ error: "Payment does not belong to this account" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ref = data.reference as string;
    const amountCents = Number(data.amount) || 0;
    const amountPaidUsd = amountCents / 100;
    const kind = metaKind(data);

    if (kind === "donation") {
      const { data: rpcData, error: rpcErr } = await adminClient.rpc("record_donation_event", {
        p_user_id: user.id,
        p_paystack_ref: ref,
        p_amount_paid_usd: amountPaidUsd,
      });
      if (rpcErr) console.error("record_donation_event:", rpcErr);
      return new Response(
        JSON.stringify({
          verified: true,
          kind: "donation",
          duplicate: rpcData?.duplicate === true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (kind === "credits") {
      const granted = creditsFromPayment(amountPaidUsd);
      const { data: rpcData, error: rpcErr } = await adminClient.rpc("apply_credit_topup", {
        p_user_id: user.id,
        p_paystack_ref: ref,
        p_amount_paid_usd: amountPaidUsd,
        p_credits_granted_usd: granted,
      });
      if (rpcErr) {
        console.error("apply_credit_topup:", rpcErr);
        throw rpcErr;
      }
      return new Response(
        JSON.stringify({
          verified: true,
          kind: "credits",
          balance: rpcData?.balance,
          credits_added: granted,
          amount_paid_usd: amountPaidUsd,
          duplicate: rpcData?.duplicate === true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Legacy $30 subscription (old Paystack plan checkout)
    if (amountCents === LEGACY_SUB_AMOUNT_CENTS) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + 30);
      await adminClient.from("subscriptions").upsert(
        {
          user_id: user.id,
          paystack_customer_code: data.customer?.customer_code || null,
          paystack_subscription_code: ref,
          paystack_email: user.email,
          status: "active",
          amount: LEGACY_SUB_AMOUNT_CENTS,
          currency: "USD",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" },
      );
      return new Response(
        JSON.stringify({ verified: true, kind: "legacy_subscription", status: "active" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Charge without metadata.kind but not legacy amount — grant credits from amount (recovery path)
    const granted = Math.round(amountPaidUsd * CREDIT_PAYOUT_RATIO * 10_000) / 10_000;
    const { data: rpcData, error: rpcErr } = await adminClient.rpc("apply_credit_topup", {
      p_user_id: user.id,
      p_paystack_ref: ref,
      p_amount_paid_usd: amountPaidUsd,
      p_credits_granted_usd: granted,
    });
    if (rpcErr) console.error("apply_credit_topup (fallback):", rpcErr);
    return new Response(
      JSON.stringify({
        verified: true,
        kind: "credits",
        balance: rpcData?.balance,
        credits_added: granted,
        amount_paid_usd: amountPaidUsd,
        duplicate: rpcData?.duplicate === true,
        note: "metadata.kind missing — credits granted from charge amount",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Verify error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
