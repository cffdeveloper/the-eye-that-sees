import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function embedOpenAI(text: string, apiKey: string): Promise<number[] | null> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const v = j.data?.[0]?.embedding;
  return Array.isArray(v) ? v : null;
}

function contentHash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `h_${(h >>> 0).toString(16)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "upsert_note");

    if (action === "upsert_note") {
      const sbUser = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await sbUser.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const content = String(body.content || "").trim().slice(0, 12_000);
      const kind = String(body.kind || "note").slice(0, 32);
      if (!content) {
        return new Response(JSON.stringify({ error: "content required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const sb = createClient(supabaseUrl, serviceKey);
      const { data: row, error } = await sb
        .from("user_memory")
        .insert({
          user_id: user.id,
          kind,
          content,
          metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
        })
        .select("id")
        .single();

      if (error) throw error;

      const openai = Deno.env.get("OPENAI_API_KEY");
      if (openai && row?.id) {
        const emb = await embedOpenAI(content, openai);
        if (emb && emb.length === 1536) {
          const ch = contentHash(content);
          const { error: embErr } = await sb.from("memory_embeddings").upsert(
            {
              user_id: user.id,
              user_memory_id: row.id,
              content_hash: ch,
              embedding: emb as unknown as string,
            },
            { onConflict: "user_id,content_hash" },
          );
          if (embErr) console.error("memory_embedding upsert:", embErr);
        }
      }

      return new Response(JSON.stringify({ ok: true, id: row?.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("memory-manager:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
