import type { Profile } from "@/contexts/AuthContext";

function firstTokenFromProfile(raw: string): string | null {
  const firstWord = raw.split(/\s+/)[0] ?? "";
  const unicode = firstWord.match(/^[\p{L}][\p{L}\p{N}'-]*/u);
  if (unicode?.[0]) return unicode[0].slice(0, 32);
  const ascii = firstWord.replace(/[^A-Za-z0-9'-].*$/, "").replace(/^[^A-Za-z0-9]+/, "");
  return ascii.length > 0 ? ascii.slice(0, 32) : null;
}

function firstTokenFromEmail(email: string): string | null {
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  if (!local) return null;
  const token = local.split(/\s+/)[0]?.replace(/[^A-Za-z0-9].*$/, "");
  return token && token.length > 0 ? token.slice(0, 32) : null;
}

/** Short first name for nav + headings, or null if we should use generic copy. */
export function profileFirstName(profile: Profile | null, email?: string | null): string | null {
  const raw = profile?.display_name?.trim() || profile?.full_name?.trim();
  if (raw) {
    const t = firstTokenFromProfile(raw);
    if (t) return t;
  }
  if (email) {
    const t = firstTokenFromEmail(email);
    if (t) return t;
  }
  return null;
}

/** Nav label: first name, or "My desk". */
export function deskNavLabel(profile: Profile | null, email?: string | null): string {
  return profileFirstName(profile, email) ?? "My desk";
}

/** Main `<h1>` title. */
export function opportunityDeskTitle(profile: Profile | null, email?: string | null): string {
  const n = profileFirstName(profile, email);
  if (!n) return "Your opportunity desk";
  return `${n}'s opportunity desk`;
}

/** "Train Sam" vs "Train your profile". */
export function trainActionLabel(profile: Profile | null, email?: string | null): string {
  const n = profileFirstName(profile, email);
  return n ? `Train ${n}` : "Train your profile";
}
