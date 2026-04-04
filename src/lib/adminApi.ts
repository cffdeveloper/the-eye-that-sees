import { supabase } from "@/integrations/supabase/client";

export async function invokeAdminApi<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-api", { body });
  if (error) throw new Error(error.message || "admin-api failed");
  const payload = data as T & { error?: string };
  if (payload && typeof payload === "object" && typeof payload.error === "string" && payload.error) {
    throw new Error(payload.error);
  }
  return data as T;
}
