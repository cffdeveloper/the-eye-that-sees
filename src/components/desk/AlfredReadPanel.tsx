import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Copy, Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { getTrainingCorpus } from "@/lib/alfredStorage";
import { downloadIntelBriefPdf } from "@/lib/exportIntelBriefPdf";
import { BlockMarkdown } from "@/components/InlineMarkdown";
import { formatDistanceToNow } from "date-fns";

type BriefRow = Database["public"]["Tables"]["user_read_briefs"]["Row"];

const AUTO_DIGEST_MS = 2 * 60 * 60 * 1000;

export function AlfredReadPanel({ geoHint }: { geoHint: string }) {
  const [rows, setRows] = useState<BriefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<BriefRow[]>([]);
  rowsRef.current = rows;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-read-brief", {
        body: { action: "list" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
      const list = (data?.briefs as BriefRow[]) || [];
      setRows(list);
      if (list[0]?.id) setSelectedId(list[0].id);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not load briefs");
    } finally {
      setLoading(false);
    }
  }, []);

  const runStandardDigest = useCallback(
    async (opts?: { silent?: boolean }) => {
      setGenerating(true);
      try {
        const trainingCorpus = getTrainingCorpus();
        const priorDigestExcerpts = rowsRef.current.slice(0, 3).map((r) => (r.body_markdown || "").slice(0, 560));
        const { data, error } = await supabase.functions.invoke("daily-read-brief", {
          body: {
            action: "standard",
            trainingCorpus,
            geoHint,
            fullIndustrySweep: true,
            priorDigestExcerpts,
          },
        });
        if (error) throw error;
        if (data?.code === "INSUFFICIENT_CREDITS") {
          toast.error("Add credits to generate digests.");
          return;
        }
        if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
        if (data?.brief?.id) {
          if (!opts?.silent) toast.success("Digest saved");
          await load();
          setSelectedId(data.brief.id);
        }
      } catch (e) {
        console.error(e);
        if (!opts?.silent) toast.error(e instanceof Error ? e.message : "Could not generate");
      } finally {
        setGenerating(false);
      }
    },
    [geoHint, load],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = window.setTimeout(() => void runStandardDigest({ silent: true }), 4_000);
    const id = window.setInterval(() => void runStandardDigest({ silent: true }), AUTO_DIGEST_MS);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, [runStandardDigest]);

  const handlePdf = async () => {
    if (!printRef.current || !selected) return;
    try {
      await downloadIntelBriefPdf({
        contentElement: printRef.current,
        documentTitle: selected.title,
      });
    } catch (e) {
      console.error(e);
      toast.error("PDF export failed");
    }
  };

  const handleCopyBriefOnly = async () => {
    if (!selected?.body_markdown) return;
    try {
      await navigator.clipboard.writeText(selected.body_markdown);
      toast.success("Brief copied — markdown only.");
    } catch {
      toast.error("Could not copy");
    }
  };

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-border/50 bg-card/60 p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Autonomous digests</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-xl">
              A new cross-industry standard digest is generated about every two hours and saved here. You can also run one immediately.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5" disabled={loading} onClick={() => void load()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Reload list
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-lg gap-1.5 font-semibold"
              disabled={generating}
              onClick={() => void runStandardDigest({ silent: false })}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
              Generate now
            </Button>
          </div>
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
          No briefs yet — the first digest will generate shortly, or tap <strong className="text-foreground">Generate now</strong>.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <aside className="rounded-xl border border-border/50 bg-muted/20 p-2 max-h-[min(70vh,520px)] overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground px-2 py-1">History</p>
            <ul className="space-y-1">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                      selected?.id === r.id ? "bg-primary/15 text-primary font-semibold" : "hover:bg-muted/50 text-foreground/90"
                    }`}
                  >
                    <span className="line-clamp-2">{r.title}</span>
                    <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0 space-y-3">
            {selected && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" className="rounded-lg gap-1.5" onClick={() => void handlePdf()}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => void handleCopyBriefOnly()}>
                    <Copy className="h-4 w-4" />
                    Copy brief only
                  </Button>
                </div>
                <div
                  ref={printRef}
                  data-pdf-export="true"
                  className="read-brief-markdown rounded-2xl border border-border/50 bg-card p-3 sm:p-4 max-w-none text-sm leading-relaxed text-foreground"
                >
                  <BlockMarkdown content={selected.body_markdown} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
