/**
 * Shared horizontal inset for the app shell: top bar, main scroll region, and sidebar nav.
 * Minimal side margins so workspace content can use the full width.
 */
export const workspacePaddingX = "px-3 sm:px-3.5 md:px-4";

/** Main column: spacing below the fixed top bar and bottom safe-area inset. */
export const workspaceMainPaddingY =
  "pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]";
