const KEY = "infinitygap_trial_intel_prompts_used";
const MAX = 3;

export function getTrialIntelPromptCount(): number {
  try {
    const n = parseInt(localStorage.getItem(KEY) || "0", 10);
    return Number.isFinite(n) && n >= 0 ? Math.min(n, MAX) : 0;
  } catch {
    return 0;
  }
}

export function incrementTrialIntelPromptCount(): void {
  try {
    const next = Math.min(MAX, getTrialIntelPromptCount() + 1);
    localStorage.setItem(KEY, String(next));
  } catch {
    /* ignore */
  }
}

export function trialIntelPromptsRemaining(): number {
  return Math.max(0, MAX - getTrialIntelPromptCount());
}

export const TRIAL_INTEL_MAX_PROMPTS = MAX;
