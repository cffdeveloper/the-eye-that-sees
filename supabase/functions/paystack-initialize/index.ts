import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CREDIT_PAYOUT_RATIO,
  MAX_CREDIT_PURCHASE_USD,
  MIN_CREDIT_PURCHASE_USD,
  MIN_DONATION_USD,
  creditsFromPayment,
} from "../_shared/creditsConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY not configured");

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
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const billingEmail = (() => {
      if (user.email) return user.email;
      const meta = user.user_metadata as { email?: string } | undefined;
      if (meta?.email) return meta.email;
      for (const id of user.identities ?? []) {
        const data = id.identity_data as { email?: string } | undefined;
        if (data?.email) return data.email;
      }
      return "";
    })();

    if (!billingEmail?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Add an email to your account in Profile before purchasing.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const callbackUrl = body.callbackUrl as string | undefined;
    const kind = body.kind as string;
    const amountUsd = Number(body.amountUsd);

    if (kind !== "credits" && kind !== "donation") {
      return new Response(JSON.stringify({ error: "kind must be 'credits' or 'donation'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let amountCents: number;
    let metadata: Record<string, string>;

    if (kind === "donation") {
      if (!Number.isFinite(amountUsd) || amountUsd < MIN_DONATION_USD || amountUsd > MAX_CREDIT_PURCHASE_USD) {
        return new Response(
          JSON.stringify({ error: `Donation must be between $${MIN_DONATION_USD} and $${MAX_CREDIT_PURCHASE_USD}.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      amountCents = Math.round(amountUsd * 100);
      metadata = {
        user_id: user.id,
        kind: "donation",
        amount_usd: amountUsd.toFixed(2),
      };
    } else {
      if (!Number.isFinite(amountUsd) || amountUsd < MIN_CREDIT_PURCHASE_USD || amountUsd > MAX_CREDIT_PURCHASE_USD) {
        return new Response(
          JSON.stringify({
            error: `Credit purchases must be between $${MIN_CREDIT_PURCHASE_USD} and $${MAX_CREDIT_PURCHASE_USD}.`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      amountCents = Math.round(amountUsd * 100);
      const credits = creditsFromPayment(amountUsd);
      metadata = {
        user_id: user.id,
        kind: "credits",
        amount_usd: amountUsd.toFixed(2),
        credits_usd: credits.toFixed(4),
        payout_ratio: String(CREDIT_PAYOUT_RATIO),
      };
    }

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: billingEmail,
        amount: amountCents,
        currency: "USD",
        callback_url:
          callbackUrl || "https://infinitygap.onrender.com/dashboard?payment=verify",
        channels: ["card"],
        metadata: {
          ...metadata,
          custom_fields: [
            { display_name: "User ID", variable_name: "user_id", value: user.id },
            { display_name: "Kind", variable_name: "kind", value: metadata.kind },
          ],
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      console.error("Paystack error:", paystackData);
      throw new Error(paystackData.message || "Paystack initialization failed");
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        kind: metadata.kind,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
