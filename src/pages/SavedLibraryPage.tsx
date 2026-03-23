import { useCallback, useEffect, useState } from "react";
import { Trash2, Bookmark, ChevronRight, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { FullPagePaywall } from "@/components/SubscriptionGate";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import {
  listIntelItems,
  deleteIntelItem,
  type SavedContentRecord,
  type SavedContentSource,
} from "@/lib/savedIntelStorage";
import { DownloadIntelPdfButton } from "@/components/saved/DownloadIntelPdfButton";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SOURCE_LABEL: Record<SavedContentSource, string> = {
  trial_showcase: "Showcase",
  region_analytics: "Region",
  custom_intel: "Infinity Lab",
  other: "Saved",
};

function formatWhen(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SavedLibraryPage() {
  const { isPro, loading: subLoading } = useSubscription();
  const [items, setItems] = useState<SavedContentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SavedContentRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listIntelItems();
      setItems(list);
      setSelected((prev) => {
        if (!prev) return null;
        return list.find((x) => x.id === prev.id) ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (subLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPro) {
    return <FullPagePaywall />;
  }

  const onDelete = async (id: string) => {
    await deleteIntelItem(id);
    setDeleteId(null);
    if (selected?.id === id) setSelected(null);
    await refresh();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Saved</h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Intel you&apos;ve saved stays on this device (IndexedDB) so you can reopen it anytime — no refetch, works offline.
          Use <span className="font-semibold text-foreground">Save</span> when viewing a brief on Pro.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-3 shadow-sm">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Library ({items.length})
          </p>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
              Nothing saved yet. Open a brief and tap <strong className="text-foreground">Save</strong>.
            </div>
          ) : (
            <ScrollArea className="h-[min(70vh,520px)] pr-2">
              <ul className="space-y-1.5">
                {items.map((it) => {
                  const active = selected?.id === it.id;
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(it)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
                          active
                            ? "border-primary/40 bg-primary/[0.06] shadow-sm"
                            : "border-transparent bg-muted/20 hover:bg-muted/40",
                        )}
                      >
                        <Bookmark className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{it.title}</p>
                          <p className="text-[10px] text-muted-foreground">{formatWhen(it.createdAt)}</p>
                          <span className="mt-1 inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                            {SOURCE_LABEL[it.source]}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>

        <div className="min-h-[min(70vh,560px)] rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          {!selected ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Bookmark className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select an item to read your saved copy.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 pb-4">
                <div className="min-w-0 space-y-1">
                  <h2 className="text-lg font-bold text-foreground">{selected.title}</h2>
                  {selected.subtitle && <p className="text-xs text-muted-foreground">{selected.subtitle}</p>}
                  {selected.sourceDetail && (
                    <p className="text-[11px] text-muted-foreground">{selected.sourceDetail}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Saved {formatWhen(selected.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <DownloadIntelPdfButton
                    contentRootId="saved-library-reader"
                    documentTitle={selected.title}
                    label="Download PDF"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="rounded-xl gap-2 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(selected.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
              <div
                id="saved-library-reader"
                className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border/50 bg-background/50 p-4"
              >
                <BlockRenderer segments={parseBlocks(selected.body)} />
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove saved intel?</AlertDialogTitle>
            <AlertDialogDescription>
              This only deletes the copy on this device. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && onDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
