/** Single admin account — must match `admin-api` Edge Function gate. */
export const ADMIN_EMAIL = "intelgoldmine@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
