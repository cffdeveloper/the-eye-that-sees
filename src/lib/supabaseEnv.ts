/**
 * Vite replaces import.meta.env.VITE_* at build time.
 * If these are missing, fail soft at runtime with a clear UI message
 * instead of crashing before React mounts.
 */
function read(name: string, value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

const url = read("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL as string | undefined);
const key = read(
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
);

const missing: string[] = [];
if (!url) missing.push("VITE_SUPABASE_URL");
if (!key) missing.push("VITE_SUPABASE_PUBLISHABLE_KEY");

export const SUPABASE_ENV_ERROR =
  missing.length > 0
    ? `[Infinitygap] Missing ${missing.join(" and ")}. Set it in .env locally, and in your host (e.g. Render → Environment) for production. Vite bakes VITE_* into the bundle at build time — add the vars, then trigger a new build/deploy.`
    : null;

// Keep exports defined so imports don't crash. The app gates on SUPABASE_ENV_ERROR.
export const SUPABASE_URL = url || "https://invalid.localhost";
export const SUPABASE_PUBLISHABLE_KEY = key || "invalid-anon-key";
