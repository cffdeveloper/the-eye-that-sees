-- Optional secret slot for Semantic Scholar (data-collector academic ingestion)
INSERT INTO public.api_integrations (key_code, display_name, description, source_file_hint, sort_order)
VALUES
  (
    'SEMANTIC_SCHOLAR_API_KEY',
    'Semantic Scholar API (optional)',
    'Optional API key for higher rate limits when data-collector queries Semantic Scholar per industry.',
    'supabase/functions/data-collector',
    65
  )
ON CONFLICT (key_code) DO NOTHING;
