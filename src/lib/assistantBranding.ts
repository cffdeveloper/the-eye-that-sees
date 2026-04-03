/**
 * Stable URL segment for the personal opportunity desk (name comes from profile in UI).
 * Legacy paths `/alfred` and `/jordan` redirect here.
 */
export const OPPORTUNITY_DESK_PATH = "my-desk";

export const assistantHomePath = `/${OPPORTUNITY_DESK_PATH}` as const;

export function assistantDeepDivePath(insightId: string): string {
  return `/${OPPORTUNITY_DESK_PATH}/deep-dive/${encodeURIComponent(insightId)}`;
}
