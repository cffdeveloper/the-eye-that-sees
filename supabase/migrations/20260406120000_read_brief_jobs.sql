-- Multi-hour extended read pipeline (stepped research, then compile ~50-page equivalent).

CREATE TABLE IF NOT EXISTS public.user_read_brief_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'compiling', 'complete', 'failed')),
  step int NOT NULL DEFAULT 0,
  max_steps int NOT NULL DEFAULT 60,
  research_waves jsonb NOT NULL DEFAULT '[]'::jsonb,
  queries_used text[] NOT NULL DEFAULT '{}',
  training_corpus_snapshot text,
  geo_hint text,
  result_brief_id uuid REFERENCES public.user_read_briefs (id) ON DELETE SET NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_read_brief_jobs_user_status_idx ON public.user_read_brief_jobs (user_id, status, created_at DESC);

ALTER TABLE public.user_read_brief_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own read brief jobs"
  ON public.user_read_brief_jobs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_read_brief_jobs IS 'Extended read: one research wave per tick; client calls tick every ~2min until complete.';

ALTER TABLE public.user_read_briefs
  ADD COLUMN IF NOT EXISTS brief_kind text NOT NULL DEFAULT 'standard' CHECK (brief_kind IN ('standard', 'extended'));

COMMENT ON COLUMN public.user_read_briefs.brief_kind IS 'standard = quick digest; extended = multi-hour research pipeline output.';
