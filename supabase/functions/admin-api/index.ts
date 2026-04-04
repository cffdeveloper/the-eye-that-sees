import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = (Deno.env.get("ADMIN_EMAIL") || "intelgoldmine@gmail.com").toLowerCase();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function maskSecret(value: string | null | undefined): string {
  if (!value || value.length === 0) return "";
  if (value.length <= 8) return "••••••••";
  return `••••••••${value.slice(-4)}`;
}

async function checkIntegrationHealth(keyCode: string, secret: string): Promise<{ ok: boolean; message: string }> {
  const k = secret.trim();
  if (!k) return { ok: false, message: "Empty secret" };

  const upper = keyCode.toUpperCase();
  if (upper.includes("LOVABLE") || (upper.includes("OPENAI") && k.startsWith("sk-"))) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/models", {
        headers: { Authorization: `Bearer ${k}` },
      });
      if (r.ok) return { ok: true, message: `Gateway OK (${r.status})` };
      const t = await r.text();
      return { ok: false, message: `HTTP ${r.status}: ${t.slice(0, 120)}` };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Request failed" };
    }
  }

  if (upper.includes("PAYSTACK") && upper.includes("SECRET")) {
    return { ok: k.length >= 20, message: k.length >= 20 ? "Secret length OK (manual verification)" : "Secret seems short" };
  }

  if (upper.startsWith("VITE_") || upper.includes("SUPABASE_URL")) {
    return { ok: k.startsWith("http") || k.length > 20, message: "Value present (no remote probe for this key type)" };
  }

  return { ok: true, message: "Secret stored (no automated test for this integration)" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing Authorization" }, 401);

  const jwt = authHeader.replace("Bearer ", "");
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
  const email = userData?.user?.email?.toLowerCase();
  if (userErr || !email || email !== ADMIN_EMAIL.toLowerCase()) {
    return json({ error: "Forbidden — admin only" }, 403);
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const body = req.method === "GET" ? {} : await req.json().catch(() => ({}));
    const action = (req.method === "GET" ? new URL(req.url).searchParams.get("action") : body.action) as string;

    if (action === "dashboard" || action === "overview") {
      const [{ count: userCount }, { count: subActive }] = await Promise.all([
        sb.from("profiles").select("*", { count: "exact", head: true }),
        sb.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      ]);

      const { data: usageSums } = await sb.from("ai_usage_events").select("user_id, tokens_in, tokens_out");
      const tokenByUser = new Map<string, number>();
      for (const row of usageSums || []) {
        const uid = row.user_id as string | null;
        if (!uid) continue;
        const t = (row.tokens_in || 0) + (row.tokens_out || 0);
        tokenByUser.set(uid, (tokenByUser.get(uid) || 0) + t);
      }

      return json({
        profileCount: userCount ?? 0,
        activeSubscriptions: subActive ?? 0,
        totalTokenUnitsLogged: [...tokenByUser.values()].reduce((a, b) => a + b, 0),
        note:
          "Token totals come from ai_usage_events when Edge Functions log usage. Enable instrumentation to populate.",
      });
    }

    if (action === "users") {
      const { data: authData, error: listErr } = await sb.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) return json({ error: listErr.message }, 500);

      const users = authData?.users || [];
      const ids = users.map((u) => u.id);

      const { data: profiles } = await sb.from("profiles").select("*").in("id", ids);
      const { data: subs } = await sb.from("subscriptions").select("*").in("user_id", ids);

      const { data: usageRows } = await sb.from("ai_usage_events").select("user_id, tokens_in, tokens_out");
      const tokenByUser = new Map<string, number>();
      for (const row of usageRows || []) {
        const uid = row.user_id as string | null;
        if (!uid) continue;
        const t = (row.tokens_in || 0) + (row.tokens_out || 0);
        tokenByUser.set(uid, (tokenByUser.get(uid) || 0) + t);
      }

      const profileById = new Map((profiles || []).map((p: { id: string }) => [p.id, p]));
      const subsByUser = new Map<string, typeof subs>();
      for (const s of subs || []) {
        const arr = subsByUser.get(s.user_id) || [];
        arr.push(s);
        subsByUser.set(s.user_id, arr);
      }

      const rows = users.map((u) => {
        const subList = subsByUser.get(u.id) || [];
        const active = subList.find((s) => s.status === "active");
        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          profile: profileById.get(u.id) || null,
          subscription: active || subList[0] || null,
          tokens_total: tokenByUser.get(u.id) || 0,
        };
      });

      return json({ users: rows });
    }

    if (action === "page_analytics") {
      const { data: raw } = await sb.from("page_views").select("path, user_id");
      const map = new Map<string, { views: number; unique_users: Set<string> }>();
      for (const r of raw || []) {
        const p = r.path as string;
        if (!map.has(p)) map.set(p, { views: 0, unique_users: new Set() });
        const e = map.get(p)!;
        e.views += 1;
        if (r.user_id) e.unique_users.add(r.user_id as string);
      }
      const paths = [...map.entries()]
        .map(([path, v]) => ({
          path,
          views: v.views,
          unique_visitors: v.unique_users.size,
        }))
        .sort((a, b) => b.views - a.views);
      return json({ paths });
    }

    if (action === "api_integrations_list") {
      const { data, error } = await sb.from("api_integrations").select("*").order("sort_order", { ascending: true });
      if (error) return json({ error: error.message }, 500);
      const list = (data || []).map((row: Record<string, unknown>) => ({
        ...row,
        secret_masked: maskSecret(row.secret_value as string),
        secret_value: undefined,
        has_secret: Boolean((row.secret_value as string)?.length),
      }));
      return json({ integrations: list });
    }

    if (action === "api_integration_get") {
      const id = body.id as string;
      if (!id) return json({ error: "id required" }, 400);
      const { data, error } = await sb.from("api_integrations").select("*").eq("id", id).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Not found" }, 404);
      return json({
        integration: {
          ...data,
          secret_value: data.secret_value || "",
        },
      });
    }

    if (action === "api_integration_upsert") {
      const p = body.payload as Record<string, unknown>;
      const key_code = String(p.key_code || "").trim();
      const display_name = String(p.display_name || "").trim();
      if (!key_code || !display_name) return json({ error: "key_code and display_name required" }, 400);

      const row = {
        key_code,
        display_name,
        description: (p.description as string) || null,
        secret_value: (p.secret_value as string) || null,
        source_file_hint: (p.source_file_hint as string) || null,
        sort_order: Number(p.sort_order) || 0,
        updated_at: new Date().toISOString(),
      };

      if (p.id) {
        const { data, error } = await sb.from("api_integrations").update(row).eq("id", p.id).select("*").single();
        if (error) return json({ error: error.message }, 500);
        return json({ integration: { ...data, secret_masked: maskSecret(data.secret_value) } });
      }

      const { data, error } = await sb.from("api_integrations").insert(row).select("*").single();
      if (error) return json({ error: error.message }, 500);
      return json({ integration: { ...data, secret_masked: maskSecret(data.secret_value) } });
    }

    if (action === "api_integration_delete") {
      const id = body.id as string;
      if (!id) return json({ error: "id required" }, 400);
      const { error } = await sb.from("api_integrations").delete().eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "api_health_check") {
      const id = body.id as string;
      if (!id) return json({ error: "id required" }, 400);
      const { data: row, error } = await sb.from("api_integrations").select("*").eq("id", id).maybeSingle();
      if (error || !row) return json({ error: "Not found" }, 404);

      const secret = (row.secret_value as string) || "";
      const result = await checkIntegrationHealth(row.key_code as string, secret);
      const status = result.ok ? "ok" : "error";

      await sb.from("api_integrations").update({
        health_status: status,
        last_health_message: result.message,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", id);

      await sb.from("api_health_history").insert({
        integration_id: id,
        status,
        message: result.message,
      });

      return json({ ok: result.ok, status, message: result.message });
    }

    if (action === "api_health_history") {
      const id = body.integration_id as string | undefined;
      let q = sb.from("api_health_history").select("*").order("checked_at", { ascending: false }).limit(50);
      if (id) q = q.eq("integration_id", id);
      const { data, error } = await q;
      if (error) return json({ error: error.message }, 500);
      return json({ history: data || [] });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("admin-api", e);
    return json({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
});
