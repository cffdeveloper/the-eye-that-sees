import type { ContentSegment, StructuredBlock } from "./blockTypes";

const BLOCK_REGEX = /:::(metrics|comparison|framework|insights|steps|score)\n([\s\S]*?):::/g;

function tryParseJSON(raw: string): unknown | null {
  try {
    return JSON.parse(raw.trim());
  } catch {
    // Try to fix common issues
    try {
      const fixed = raw.trim()
        .replace(/,\s*([}\]])/g, "$1") // trailing commas
        .replace(/'/g, '"'); // single quotes
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}

function parseLooseFrameworkObject(content: string): StructuredBlock | null {
  const parsed = tryParseJSON(content);
  if (!parsed || typeof parsed !== "object") return null;
  const raw = parsed as Record<string, unknown>;
  const rawSections = Array.isArray(raw.sections) ? raw.sections : null;
  if (!rawSections || typeof raw.title !== "string") return null;

  const sections = rawSections
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const section = s as Record<string, unknown>;
      const items = Array.isArray(section.items) ? section.items.map((x) => String(x)) : [];
      return {
        label: String(section.label || "").trim(),
        color: String(section.color || "cyan").trim().toLowerCase(),
        items,
        status:
          typeof section.status === "string" && section.status.trim().length > 0
            ? section.status.trim()
            : undefined,
      };
    })
    .filter((x): x is { label: string; color: string; items: string[]; status?: string } => Boolean(x?.label));

  if (sections.length === 0) return null;
  return {
    type: "framework",
    data: {
      title: String(raw.title).trim(),
      type: String(raw.type || "framework").trim(),
      sections,
    },
  };
}

export function parseBlocks(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  const matches = [...content.matchAll(BLOCK_REGEX)];

  for (const match of matches) {
    const beforeText = content.slice(lastIndex, match.index);
    if (beforeText.trim()) {
      segments.push({ type: "text", content: beforeText.trim() });
    }

    const blockType = match[1] as StructuredBlock["type"];
    const jsonStr = match[2];
    const parsed = tryParseJSON(jsonStr);

    if (parsed) {
      segments.push({ type: blockType, data: parsed } as StructuredBlock);
    } else {
      // If JSON parse fails, include as text
      segments.push({ type: "text", content: `\`\`\`json\n${jsonStr.trim()}\n\`\`\`` });
    }

    lastIndex = (match.index ?? 0) + match[0].length;
  }

  const remaining = content.slice(lastIndex);
  if (remaining.trim()) {
    segments.push({ type: "text", content: remaining.trim() });
  }

  if (segments.length === 0) {
    const looseFramework = parseLooseFrameworkObject(content);
    if (looseFramework) return [looseFramework];
  }

  return segments;
}

// Extract all structured blocks from segments (for artifacts sidebar)
export function extractBlocks(segments: ContentSegment[]): StructuredBlock[] {
  return segments.filter((s): s is StructuredBlock => s.type !== "text");
}
