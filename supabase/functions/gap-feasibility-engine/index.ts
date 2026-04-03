import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { defaultGuardrailContext, hardRejectGap, type UserGuardrailContext } from "../_shared/guardrails.ts";
import { feasibilityEnginePrompt } from "../_shared/proactivePrompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title || "").slice(0, 220);
    const summary = String(body.summary || "").slice(0, 2000);
    const ctx = defaultGuardrailContext((body.user_context || {}) as Partial<UserGuardrailContext>);

    const hard = hardRejectGap(summary, title, ctx);
    if (hard.reject) {
      return new Response(
        JSON.stringify({
          feasibility_score: 0,
          profitability_score: 0,
          capital_fit: false,
          kenya_or_online_fit: false,
          employs_others_fit: false,
          reject: true,
          reject_reason: hard.reason,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({
          feasibility_score: 72,
          profitability_score: 65,
          capital_fit: true,
          kenya_or_online_fit: true,
          employs_others_fit: ctx.prefers_business_that_employs,
          reject: false,
          reject_reason: null,
          note: "LOVABLE_API_KEY missing — heuristic fallback",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const system = feasibilityEnginePrompt(ctx);
    const userMsg = `TITLE: ${title}\n\nSUMMARY:\n${summary}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      return new Response(JSON.stringify({ error: "gateway", detail: t.slice(0, 300) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gap-feasibility-engine:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
