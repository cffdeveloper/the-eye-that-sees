-- Long-form daily read briefs (Alfred / My Desk) — markdown stored; PDF export is client-side.

CREATE TABLE IF NOT EXISTS public.user_read_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  body_markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_read_briefs_user_created_idx ON public.user_read_briefs (user_id, created_at DESC);

ALTER TABLE public.user_read_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own read briefs"
  ON public.user_read_briefs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_read_briefs IS 'Personal research-style digests generated for the user; service role inserts from Edge Functions.';
