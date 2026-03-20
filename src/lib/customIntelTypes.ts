import type { Industry, SubFlow } from "@/lib/industryData";
import { industries } from "@/lib/industryData";

/** One money-flow lane from our taxonomy, possibly cross-industry */
export type PickedSubFlow = {
  key: string;
  industrySlug: string;
  industryName: string;
  subFlow: SubFlow;
};

export function buildSubFlowKey(industrySlug: string, subFlowId: string): string {
  return `${industrySlug}::${subFlowId}`;
}

export function allPickedOptions(): PickedSubFlow[] {
  const out: PickedSubFlow[] = [];
  for (const ind of industries as Industry[]) {
    for (const sf of ind.subFlows) {
      out.push({
        key: buildSubFlowKey(ind.slug, sf.id),
        industrySlug: ind.slug,
        industryName: ind.name,
        subFlow: sf,
      });
    }
  }
  return out;
}

export function findPickedByKey(key: string): PickedSubFlow | undefined {
  return allPickedOptions().find((p) => p.key === key);
}
