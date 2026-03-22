import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PLAN_NAME = "Intel GoldMine Pro Monthly";
const PLAN_AMOUNT_LOWEST = 3000; // $30.00 in cents (Paystack lowest denomination)
const PLAN_CURRENCY = "USD";
const PLAN_INTERVAL = "monthly";

/** Ensure a Paystack plan exists — create once, reuse forever. */
async function ensurePlan(secretKey: string): Promise<string> {
  // List existing plans to find ours
  const listRes = await fetch("https://api.paystack.co/plan", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const listData = await listRes.json();

  if (listData.status && listData.data?.length) {
    const existing = listData.data.find(
      (p: any) =>
        p.name === PLAN_NAME &&
        p.amount === PLAN_AMOUNT_LOWEST &&
        p.interval === PLAN_INTERVAL
    );
    if (existing) return existing.plan_code;
  }

  // Create the plan
  const createRes = await fetch("https://api.paystack.co/plan", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: PLAN_NAME,
      amount: PLAN_AMOUNT_LOWEST,
      interval: PLAN_INTERVAL,
      currency: PLAN_CURRENCY,
      description:
        "Full Intel GoldMine access — Maverick AI, deep dives, cross-industry analysis, Intel Lab.",
    }),
  });

  const createData = await createRes.json();
  if (!createData.status) {
    console.error("Failed to create plan:", createData);
    throw new Error(createData.message || "Failed to create Paystack plan");
  }

  console.log("Created Paystack plan:", createData.data.plan_code);
  return createData.data.plan_code;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY not configured");

    // Verify user auth
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
      { global: { headers: { Authorization: authHeader } } }
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

    const { callbackUrl } = await req.json();

    // Ensure the recurring plan exists on Paystack
    const planCode = await ensurePlan(PAYSTACK_SECRET_KEY);

    // Initialize a transaction linked to the plan — Paystack auto-subscribes
    // the customer to the plan after the first successful charge.
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: PLAN_AMOUNT_LOWEST,
          currency: PLAN_CURRENCY,
          callback_url:
            callbackUrl || "https://intelgoldmine.onrender.com/dashboard?payment=verify",
          plan: planCode,
          channels: ["card"],
          metadata: {
            user_id: user.id,
            plan: "pro_monthly",
            custom_fields: [
              {
                display_name: "User ID",
                variable_name: "user_id",
                value: user.id,
              },
            ],
          },
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      console.error("Paystack error:", paystackData);
      throw new Error(paystackData.message || "Paystack initialization failed");
    }

    // Upsert subscription record as pending
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await adminClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        paystack_email: user.email,
        plan_code: planCode,
        status: "pending",
        amount: 3000,
        currency: PLAN_CURRENCY,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
