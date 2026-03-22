# Intel GoldMine

React + Vite frontend: **Intel GoldMine** is the product — AI-powered market intelligence (Supabase-backed intel pipelines, edge functions, and structured analysis).

## Development

```bash
npm install
npm run dev
```

App runs at [http://localhost:8080](http://localhost:8080) by default.

## Scripts

- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — Vitest

Configure Supabase URL and keys via your environment (see `.env` or hosting provider secrets).

### Scheduled ingestion & auto-reports

- **`pg_cron` + `pg_net`** are enabled in migrations. A follow-up migration registers **5-minute** jobs for **`data-collector`** (raw signals, many countries) and **`auto-intel`** (rotating industry/sub-flow snapshots into `intel_snapshots`).
- You must set **`app.supabase_service_role_jwt`** on the database so cron can call Edge Functions with a valid JWT — see [docs/cron-scheduling.md](docs/cron-scheduling.md).
- Without that secret, jobs no-op with a PostgreSQL warning until configured.

Chat streaming calls the `maverick-ai` Edge Function. Deploy it with the Supabase CLI (`supabase functions deploy maverick-ai`). Remove older `vertex-ai` or `nexus-ai` deployments when you are done migrating.
