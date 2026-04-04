-- Admin dashboard: page analytics, API integration registry, optional AI usage logging.
-- All sensitive reads/writes go through Edge Function `admin-api` (service role + email gate).

-- Page views (client inserts own rows only)
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_path_created_at_idx ON public.page_views (path, created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_user_id_idx ON public.page_views (user_id);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "page_views_insert_own" ON public.page_views;
CREATE POLICY "page_views_insert_own"
  ON public.page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No SELECT/UPDATE/DELETE for authenticated users (admin reads via service role only)

-- API integration registry (secrets — never expose to anon/authenticated clients)
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  secret_value text,
  source_file_hint text,
  sort_order int NOT NULL DEFAULT 0,
  health_status text NOT NULL DEFAULT 'unknown',
  last_health_message text,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_integrations_sort_order_idx ON public.api_integrations (sort_order);

ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
-- No policies: only service role (Edge Functions) can access

-- Optional AI usage events (populated by Edge Functions when instrumented; admin aggregates)
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  edge_function text NOT NULL DEFAULT '',
  tokens_in int NOT NULL DEFAULT 0,
  tokens_out int NOT NULL DEFAULT 0,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_usage_events_user_created_idx ON public.ai_usage_events (user_id, created_at DESC);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

-- Health check audit trail (optional visibility)
CREATE TABLE IF NOT EXISTS public.api_health_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.api_integrations (id) ON DELETE CASCADE,
  status text NOT NULL,
  message text,
  checked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_health_history_integration_idx ON public.api_health_history (integration_id, checked_at DESC);

ALTER TABLE public.api_health_history ENABLE ROW LEVEL SECURITY;

-- Seed known integration slots (empty secrets — set in Admin UI or mirror from Supabase secrets)
INSERT INTO public.api_integrations (key_code, display_name, description, source_file_hint, sort_order)
VALUES
  ('LOVABLE_API_KEY', 'Lovable AI Gateway', 'Primary LLM gateway (Gemini/OpenAI-compatible) for intel, cross-industry, desk, and most Edge Functions.', 'supabase/functions/*/index.ts (Deno.env LOVABLE_API_KEY)', 10),
  ('SUPABASE_SERVICE_ROLE_KEY', 'Supabase service role', 'Server-side database and Auth admin access. Never expose to the browser.', 'supabase/functions (createClient + service role)', 20),
  ('SUPABASE_ANON_KEY', 'Supabase anon (publishable) key', 'Used by Edge Functions for user-scoped JWT verification and some invokes.', 'supabase/functions, Vite client', 30),
  ('PAYSTACK_SECRET_KEY', 'Paystack secret', 'Webhook signature verification and server-side Paystack API calls.', 'supabase/functions/paystack-*', 40),
  ('PAYSTACK_PUBLIC_KEY', 'Paystack public key', 'Client-side checkout initialization (if used in app).', 'paystack-initialize', 50),
  ('GNEWS_API_KEY', 'GNews API (optional)', 'Industry news when not using free tier / AI fallback.', 'supabase/functions/industry-news', 60),
  ('TWITTER_BEARER_TOKEN', 'X / Twitter API (optional)', 'Social intel when configured.', 'supabase/functions/social-intel', 70),
  ('VITE_SUPABASE_URL', 'Public Supabase URL', 'Frontend + Edge env; not secret but tracked for consistency.', 'src/lib/supabaseEnv.ts', 80),
  ('VITE_SUPABASE_PUBLISHABLE_KEY', 'Public Supabase anon key (Vite)', 'Baked into client bundle for Supabase client.', 'src/integrations/supabase/client.ts', 90)
ON CONFLICT (key_code) DO NOTHING;
