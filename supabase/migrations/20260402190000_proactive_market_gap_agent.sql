-- ═══════════════════════════════════════════════════════════════════════════
-- Proactive Market-Gap Agent: tables, pgvector, RLS, profile guardrail fields
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS vector;

-- Optional user-level defaults (Kenya / low-capital / employment preference)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS max_startup_capital_usd numeric NOT NULL DEFAULT 1000
    CHECK (max_startup_capital_usd > 0 AND max_startup_capital_usd <= 500000);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS prefers_business_that_employs boolean NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS proactive_monitoring text NOT NULL DEFAULT 'standard'
    CHECK (proactive_monitoring IN ('light', 'standard', 'intensive'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS primary_market text NOT NULL DEFAULT 'KE';

COMMENT ON COLUMN public.profiles.max_startup_capital_usd IS 'Max starting capital in USD for gap suggestions (user may raise in training notes).';
COMMENT ON COLUMN public.profiles.prefers_business_that_employs IS 'Prefer opportunities that scale via hiring vs solo hustle.';
COMMENT ON COLUMN public.profiles.proactive_monitoring IS 'Scanner cadence weight: light | standard | intensive.';
COMMENT ON COLUMN public.profiles.primary_market IS 'ISO-like market code; KE = Kenya focus + online.';

-- Long-term text memory (training snippets, feedback, synced notes)
CREATE TABLE IF NOT EXISTS public.user_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'note'
    CHECK (kind IN ('note', 'training', 'feedback', 'gap_summary', 'profile_snapshot')),
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_memory_user_created ON public.user_memory (user_id, created_at DESC);

ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own memory"
  ON public.user_memory FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own memory"
  ON public.user_memory FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own memory"
  ON public.user_memory FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own memory"
  ON public.user_memory FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Vector store for RAG (requires OPENAI_API_KEY or compatible embedding in Edge Function)
CREATE TABLE IF NOT EXISTS public.memory_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_memory_id uuid REFERENCES public.user_memory(id) ON DELETE CASCADE,
  content_hash text NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_hash)
);

CREATE INDEX IF NOT EXISTS idx_memory_embeddings_user ON public.memory_embeddings (user_id);

ALTER TABLE public.memory_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own embeddings"
  ON public.memory_embeddings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Proactive gaps surfaced by cron scanner (same shape as Alfred insight JSON + scores)
CREATE TABLE IF NOT EXISTS public.proactive_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight jsonb NOT NULL,
  feasibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  batch_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proactive_gaps_user_created ON public.proactive_gaps (user_id, created_at DESC);

ALTER TABLE public.proactive_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own proactive gaps"
  ON public.proactive_gaps FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Inserts only from service role (Edge Functions) — no direct user insert
-- Service role bypasses RLS on Supabase

-- Search tool response cache (dedupe + rate limits)
CREATE TABLE IF NOT EXISTS public.proactive_search_cache (
  cache_key text PRIMARY KEY,
  payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proactive_search_cache_exp ON public.proactive_search_cache (expires_at);

ALTER TABLE public.proactive_search_cache ENABLE ROW LEVEL SECURITY;

-- No user policies: Edge Functions use service role only
