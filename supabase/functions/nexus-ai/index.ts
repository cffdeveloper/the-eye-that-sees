import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  research: `You are NEXUS, an elite AI research analyst. You provide deep, structured analysis on any topic.

When given a research query:
1. Provide a comprehensive analysis with clear sections
2. Include key findings, data points, and insights
3. Identify trends, risks, and opportunities
4. Give actionable recommendations
5. Rate confidence level of your analysis

Format your response with clear markdown headers and bullet points. Be thorough but concise. Use data and specifics where possible.`,

  analyze: `You are NEXUS, an AI data analyst. You analyze data, text, or information provided by the user.

When analyzing:
1. Identify patterns and anomalies
2. Extract key metrics and insights
3. Provide statistical observations where relevant
4. Summarize findings clearly
5. Suggest next steps or deeper analyses

Be precise, data-driven, and actionable.`,

  strategize: `You are NEXUS, an AI strategic advisor. You help create strategies, plans, and frameworks.

When strategizing:
1. Assess the current situation
2. Identify objectives and constraints
3. Propose multiple strategic options with pros/cons
4. Recommend the optimal approach
5. Outline implementation steps

Think like a top-tier consultant. Be bold but realistic.`,

  general: `You are NEXUS, a powerful AI intelligence platform. You are knowledgeable across all domains - technology, science, finance, geopolitics, health, engineering, and more. 

Provide thorough, intelligent responses. Use structured formatting. Be direct and insightful. When you don't know something, say so clearly.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "general" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI processing error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("nexus-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
