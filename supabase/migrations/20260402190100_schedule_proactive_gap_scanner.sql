-- pg_cron: proactive-gap-scanner every 4 hours (Pro users; function batches internally)
-- Requires app.supabase_service_role_jwt — see docs/cron-scheduling.md

DO $cron$
DECLARE
  r RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron not available — skipped proactive scanner schedule.';
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE NOTICE 'pg_net not available — skipped proactive scanner schedule.';
    RETURN;
  END IF;

  FOR r IN
    SELECT jobid FROM cron.job WHERE jobname = 'cron_proactive_gap_scanner_4h'
  LOOP
    PERFORM cron.unschedule(r.jobid);
  END LOOP;

  PERFORM cron.schedule(
    'cron_proactive_gap_scanner_4h',
    '0 */4 * * *',
    $$SELECT public.cron_invoke_edge_function('proactive-gap-scanner');$$
  );
END;
$cron$;
