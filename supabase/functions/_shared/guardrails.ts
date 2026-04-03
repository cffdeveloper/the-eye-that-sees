/**
 * Hard guardrails for Kenya / low-capital / employment-preference opportunities.
 * Use before and after LLM output — never rely on the model alone.
 */

export type UserGuardrailContext = {
  region: string; // e.g. "KE"
  max_startup_capital_usd: number;
  prefers_business_that_employs: boolean;
  skills_hint: string;
  industries_of_interest: string[];
  risk_tolerance: string;
};

const ONLINE_MARKERS = /\b(online|remote|global\s+clients|SaaS|digital\s+product|marketplace|Upwork|Fiverr|Stripe|M-Pesa\s+agent|website|SEO|content\s+agency)\b/i;

const KE_MARKERS =
  /\b(Kenya|Nairobi|Mombasa|Kisumu|Eldoret|Nakuru|Safaricom|M-Pesa|KRA|KNBS|East\s+Africa|EAC|KES|Kenyan)\b/i;

const HIGH_CAPITAL_MARKERS =
  /\b(\$?\s*[2-9]\s*,\s*\d{3}\s*,\s*\d{3,}|\$1\s*,\s*[1-9]\d{2}\s*,\s*\d{3,}|USD\s*[2-9]\s*,\s*\d{3}\s*,\s*\d{3,}|million\s+USD|factory\s+fabrication|mining\s+concession|commercial\s+real\s+estate\s+development|franchise\s+fee\s+\$\s*[5-9]\d{3,})\b/i;

export function defaultGuardrailContext(partial: Partial<UserGuardrailContext>): UserGuardrailContext {
  return {
    region: partial.region || "KE",
    max_startup_capital_usd: partial.max_startup_capital_usd ?? 1000,
    prefers_business_that_employs: partial.prefers_business_that_employs ?? true,
    skills_hint: partial.skills_hint || "",
    industries_of_interest: partial.industries_of_interest?.length ? partial.industries_of_interest : ["general"],
    risk_tolerance: partial.risk_tolerance || "moderate",
  };
}

/** Reject if text clearly implies geography or capital outside user bounds. */
export function hardRejectGap(summary: string, title: string, ctx: UserGuardrailContext): { reject: boolean; reason?: string } {
  const text = `${title}\n${summary}`;
  const max = ctx.max_startup_capital_usd;

  if (HIGH_CAPITAL_MARKERS.test(text) && max <= 5000) {
    return { reject: true, reason: "Capital requirement appears above user max" };
  }

  if (ctx.region === "KE" || ctx.region === "Kenya") {
    const okGeo = KE_MARKERS.test(text) || ONLINE_MARKERS.test(text);
    if (!okGeo) {
      const abroadOnly =
        /\b(Australia|Canada\s+only|must\s+relocate\s+to\s+EU|US\s+only\s+market|licensed\s+in\s+the\s+UK\s+only)\b/i.test(text);
      if (abroadOnly) {
        return { reject: true, reason: "Opportunity not Kenya or online-remote compatible" };
      }
    }
  }

  return { reject: false };
}

/** Rough estimated capital band from text (0 = unknown). */
export function estimateCapitalBandUsd(text: string): number | null {
  const m = text.match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*)\s*(USD)?/i);
  if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  const k = text.match(/~\s*\$?([0-9]+)\s*k\b/i);
  if (k) return parseInt(k[1], 10) * 1000;
  return null;
}
