import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.224.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    const body = await req.text();

    // Verify Paystack signature
    const signature = req.headers.get("x-paystack-signature");
    if (signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(PAYSTACK_SECRET_KEY),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
      const expectedSig = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSig !== signature) {
        console.error("Invalid Paystack signature");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (event.event) {
      case "charge.success": {
        const data = event.data;
        const userId = data.metadata?.user_id;

        if (!userId) {
          console.error("No user_id in metadata");
          break;
        }

        // Calculate period end (30 days from now)
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 30);

        await adminClient.from("subscriptions").upsert(
          {
            user_id: userId,
            paystack_customer_code: data.customer?.customer_code || null,
            paystack_subscription_code: data.reference,
            paystack_email: data.customer?.email || data.metadata?.email,
            status: "active",
            amount: 3000,
            currency: "USD",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          },
          { onConflict: "user_id" }
        );

        console.log(`Subscription activated for user ${userId}`);
        break;
      }

      case "subscription.create": {
        const data = event.data;
        const customerCode = data.customer?.customer_code;

        if (customerCode) {
          // Find subscription by customer code and update
          const { data: subs } = await adminClient
            .from("subscriptions")
            .select("*")
            .eq("paystack_customer_code", customerCode)
            .limit(1);

          if (subs && subs.length > 0) {
            await adminClient
              .from("subscriptions")
              .update({
                paystack_subscription_code: data.subscription_code,
                status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("id", subs[0].id);
          }
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
        }
        break;
      }

      case "charge.failed": {
        const data = event.data;
        const userId = data.metadata?.user_id;

        if (userId) {
          await adminClient
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }

      default:
        console.log("Unhandled event:", event.event);
    }

    return new Response(JSON.stringify({ received: true }), {
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
