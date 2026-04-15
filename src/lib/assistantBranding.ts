/**
 * Personal opportunity workspace — deep dives live under this path.
 * Legacy `/my-desk`, `/alfred`, `/jordan` redirect here.
 */
export const OPPORTUNITY_DESK_PATH = "opportunities";

export const assistantHomePath = `/${OPPORTUNITY_DESK_PATH}` as const;

export function assistantDeepDivePath(insightId: string): string {
  return `/${OPPORTUNITY_DESK_PATH}/deep-dive/${encodeURIComponent(insightId)}`;
}
