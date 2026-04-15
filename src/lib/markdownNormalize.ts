/**
 * Pre-process AI/markdown strings so react-markdown parses emphasis and ATX headings reliably.
 * Models often emit: ###Heading (no space), full-width asterisks, or loose spaces inside ** **.
 */
function toMarkdownString(content: unknown): string {
  if (content == null) return "";
  return typeof content === "string" ? content : String(content);
}

export function normalizeMarkdownInput(content: string | unknown): string {
  let s = toMarkdownString(content);
  if (!s) return "";
  s = s.replace(/\u200B|\uFEFF/g, ""); // ZWSP, BOM
  // Fullwidth / compatibility asterisks → ASCII
  s = s.replace(/\uFF0A/g, "*");
  s = s.replace(/\u2217/g, "*"); // ∗ operator sometimes pasted as emphasis
  s = s.replace(/＊/g, "*");
  // ATX headings must have a space after #…# (CommonMark); fix ###Title → ### Title
  s = s.replace(/(^|\n)(\s{0,3})(#{1,6})([^\s#\r\n])/g, "$1$2$3 $4");
  // Tighten bold markers
  s = s.replace(/\*\*\s+/g, "**").replace(/\s+\*\*/g, "**");
  // Models often emit invalid "***Label**:" (triple star open) — breaks CommonMark; convert to list + bold
  s = s.replace(/\*\*\*([^*\n]{1,400}?)\*\*:/g, "- **$1**:");
  return s;
}

/** Use BlockMarkdown when a single line still carries headings / bold so we do not show raw ### or ** */
export function prefersBlockMarkdown(content: string | unknown): boolean {
  const s = toMarkdownString(content).trim();
  if (!s) return false;
  if (s.includes("\n")) return true;
  if (/^#{1,6}\s*\S/m.test(s)) return true;
  if (/\*\*[\s\S]*?\*\*/.test(s)) return true;
  return false;
}
