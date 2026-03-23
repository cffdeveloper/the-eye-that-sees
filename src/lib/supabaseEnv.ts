/**
 * Vite replaces import.meta.env.VITE_* at **build** time.
 * If these are missing when `npm run build` runs (e.g. on Render), the app ships with
 * empty strings and Supabase throws "supabaseUrl is required".
 */
function required(name: string, value: string | undefined): string {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) {
    throw new Error(
      `[Infinitygap] Missing ${name}. ` +
        `Set it in .env locally, and in your host (e.g. Render → Environment) for production. ` +
        `Vite bakes VITE_* into the bundle at build time — add the vars, then trigger a new build/deploy.`,
    );
  }
  return v;
}

export const SUPABASE_URL = required("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL as string | undefined);
export const SUPABASE_PUBLISHABLE_KEY = required(
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
);
