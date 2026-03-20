
-- Persistent insights table - stores every insight/gap/alert ever generated
CREATE TABLE public.intel_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  insight_type text NOT NULL,
  title text NOT NULL,
  detail text,
  source_industry text,
  source_subflow text,
  related_industries text[] DEFAULT '{}',
  geo_context text[] DEFAULT '{}',
  estimated_value text,
  urgency text,
  score numeric,
  tags text[] DEFAULT '{}',
  raw_data jsonb DEFAULT '{}'::jsonb,
  referenced_count integer DEFAULT 0,
  still_relevant boolean DEFAULT true
);

-- Geo-contextualized analysis cache
CREATE TABLE public.geo_intel_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  geo_scope text NOT NULL,
  scope_type text NOT NULL,
  scope_key text NOT NULL,
  analysis text,
  gaps jsonb DEFAULT '[]'::jsonb,
  alerts jsonb DEFAULT '[]'::jsonb,
  opportunities jsonb DEFAULT '[]'::jsonb,
  connections jsonb DEFAULT '[]'::jsonb,
  market_data jsonb DEFAULT '{}'::jsonb
);

-- User geo preferences
CREATE TABLE public.user_geo_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  geo_type text NOT NULL,
  geo_values text[] NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.intel_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_intel_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_geo_preferences ENABLE ROW LEVEL SECURITY;

-- Public read, service write
CREATE POLICY "Anyone can read insights" ON public.intel_insights FOR SELECT TO public USING (true);
CREATE POLICY "Service can insert insights" ON public.intel_insights FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read geo cache" ON public.geo_intel_cache FOR SELECT TO public USING (true);
CREATE POLICY "Service can insert geo cache" ON public.geo_intel_cache FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read geo prefs" ON public.user_geo_preferences FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert geo prefs" ON public.user_geo_preferences FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update geo prefs" ON public.user_geo_preferences FOR UPDATE TO public USING (true);

-- Indexes
CREATE INDEX idx_insights_industry ON public.intel_insights(source_industry);
CREATE INDEX idx_insights_type ON public.intel_insights(insight_type);
CREATE INDEX idx_insights_geo ON public.intel_insights USING GIN(geo_context);
CREATE INDEX idx_insights_relevant ON public.intel_insights(still_relevant, created_at DESC);
CREATE INDEX idx_geo_cache_scope ON public.geo_intel_cache(geo_scope, scope_type, scope_key);
CREATE INDEX idx_geo_prefs_session ON public.user_geo_preferences(session_id, is_active);
