import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { creditsFromPayment } from "../_shared/creditsConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

async function verifySignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const body = await req.text();

    // SECURITY: Verify Paystack HMAC signature
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      console.error("Missing x-paystack-signature header");
      return new Response("Missing signature", { status: 401 });
    }

    const valid = await verifySignature(body, signature, PAYSTACK_SECRET_KEY);
    if (!valid) {
      console.error("Invalid Paystack webhook signature — rejecting");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook:", event.event);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const getUserId = (data: any): string | null =>
      data.metadata?.user_id ||
      data.metadata?.custom_fields?.find((f: any) => f.variable_name === "user_id")?.value ||
      null;

    const getKind = (data: any): string | undefined => {
      const m = data.metadata;
      if (m?.kind) return String(m.kind);
      return m?.custom_fields?.find((f: any) => f.variable_name === "kind")?.value;
    };

    switch (event.event) {
      // ─── One-time credits / donations / legacy subscription renewals ───
      case "charge.success": {
        const data = event.data;
        const userId = getUserId(data);

        if (!userId) {
          console.error("charge.success: no user_id in metadata", data.metadata);
          break;
        }

        const ref = data.reference as string;
        const amountCents = Number(data.amount) || 0;
        const amountPaidUsd = amountCents / 100;
        const kind = getKind(data);

        if (kind === "donation") {
          await adminClient.rpc("record_donation_event", {
            p_user_id: userId,
            p_paystack_ref: ref,
            p_amount_paid_usd: amountPaidUsd,
          });
          console.log(`✅ Donation recorded for user ${userId}`);
          break;
        }

        if (kind === "credits") {
          const granted = creditsFromPayment(amountPaidUsd);
          await adminClient.rpc("apply_credit_topup", {
            p_user_id: userId,
            p_paystack_ref: ref,
            p_amount_paid_usd: amountPaidUsd,
            p_credits_granted_usd: granted,
          });
          console.log(`✅ Credits top-up for user ${userId}`);
          break;
        }

        // Recurring / plan-linked subscription (legacy)
        if (data.plan_object?.plan_code || data.plan) {
          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setDate(periodEnd.getDate() + 30);

          await adminClient.from("subscriptions").upsert(
            {
              user_id: userId,
              paystack_customer_code: data.customer?.customer_code || null,
              paystack_subscription_code: data.plan_object?.subscription_code || data.reference,
              paystack_email: data.customer?.email,
              plan_code: data.plan_object?.plan_code || data.plan || null,
              status: "active",
              amount: 3000,
              currency: "USD",
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              updated_at: now.toISOString(),
            },
            { onConflict: "user_id" },
          );

          console.log(`✅ Subscription activated for user ${userId}`);
          break;
        }

        if (amountCents === 3000) {
          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setDate(periodEnd.getDate() + 30);
          await adminClient.from("subscriptions").upsert(
            {
              user_id: userId,
              paystack_customer_code: data.customer?.customer_code || null,
              paystack_subscription_code: ref,
              paystack_email: data.customer?.email,
              status: "active",
              amount: 3000,
              currency: "USD",
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              updated_at: now.toISOString(),
            },
            { onConflict: "user_id" },
          );
          console.log(`✅ Legacy $30 subscription for user ${userId}`);
          break;
        }

        console.log("charge.success: unhandled shape", { kind, amountCents });
        break;
      }

      // ─── Subscription lifecycle ───
      case "subscription.create": {
        const data = event.data;
        const customerCode = data.customer?.customer_code;
        if (customerCode) {
          await adminClient
            .from("subscriptions")
            .update({
              paystack_subscription_code: data.subscription_code,
              plan_code: data.plan?.plan_code,
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("paystack_customer_code", customerCode);
          console.log(`✅ subscription.create for customer ${customerCode}`);
        }
        break;
      }

      case "subscription.not_renew":
      case "subscription.disable": {
        const data = event.data;
        const customerCode = data.customer?.customer_code;
        if (customerCode) {
          await adminClient
            .from("subscriptions")
            .update({
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("paystack_customer_code", customerCode);
          console.log(`⛔ Subscription cancelled for customer ${customerCode}`);
        }
        break;
      }

      // ─── Charge failures (card declined on renewal) ───
      case "charge.failed": {
        const data = event.data;
        const userId = getUserId(data);
        if (userId) {
          await adminClient
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
          console.log(`⚠️ Charge failed for user ${userId}`);
        }
        break;
      }

      // ─── Invoice events for renewal tracking ───
      case "invoice.create":
      case "invoice.update": {
        console.log("Invoice event:", event.event, event.data?.invoice_code);
        break;
      }

      default:
        console.log("Unhandled event:", event.event);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
