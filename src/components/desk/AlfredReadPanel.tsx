import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Download, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { ProUpgradePrompt } from "@/components/ProUpgradePrompt";
import { getTrainingCorpus } from "@/lib/alfredStorage";
import { downloadIntelBriefPdf } from "@/lib/exportIntelBriefPdf";
import { normalizeMarkdownInput } from "@/lib/markdownNormalize";
import { formatDistanceToNow } from "date-fns";

type BriefRow = Database["public"]["Tables"]["user_read_briefs"]["Row"];

export function AlfredReadPanel({ geoHint, isPro }: { geoHint: string; isPro: boolean }) {
  const [rows, setRows] = useState<BriefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_read_briefs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) {
      console.error(error);
      toast.error("Could not load briefs");
    } else {
      setRows((data as BriefRow[]) || []);
      if (data?.[0]?.id) setSelectedId(data[0].id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  const generate = async () => {
    setGenerating(true);
    try {
      const trainingCorpus = getTrainingCorpus();
      const { data, error } = await supabase.functions.invoke("daily-read-brief", {
        body: { trainingCorpus, geoHint },
      });
      if (error) throw error;
      if (data?.code === "RATE_LIMIT") {
        toast.message(data.error || "Try again later.");
        return;
      }
      if (data?.code === "INSUFFICIENT_CREDITS") {
        toast.error("Add credits to generate a digest.");
        return;
      }
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
      if (data?.brief?.id) {
        toast.success("Digest saved");
        await load();
        setSelectedId(data.brief.id);
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not generate");
    } finally {
      setGenerating(false);
    }
  };

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

  if (!isPro) {
    return (
      <div className="rounded-2xl border border-border/50 bg-muted/10 p-6">
        <p className="text-sm font-semibold text-foreground mb-2">Daily read</p>
        <p className="text-xs text-muted-foreground mb-4">
          A long-form research-style digest tailored to your profile and notes — new editions saved here with PDF export.
        </p>
        <ProUpgradePrompt feature="Add credits to generate and store daily research digests." />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Daily read</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            One deep digest per day (credit charge applies). Grounded on open web research when Tavily is configured. Download any edition as PDF.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5" disabled={loading} onClick={() => void load()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Reload list
          </Button>
          <Button type="button" size="sm" className="rounded-lg gap-1.5 font-semibold" disabled={generating} onClick={() => void generate()}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            Generate today&apos;s digest
          </Button>
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          No digests yet. Generate your first one — it will appear in this library.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
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
                </div>
                <div
                  ref={printRef}
                  data-pdf-export="true"
                  className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {normalizeMarkdownInput(selected.body_markdown)}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
