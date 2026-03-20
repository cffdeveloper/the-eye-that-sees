import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import { Loader2, Search, X } from "lucide-react";

interface DeepDiveDialogProps {
  open: boolean;
  onClose: () => void;
  topic: string;
  context?: string;
  industryName?: string;
  subFlowName?: string;
}

export function DeepDiveDialog({ open, onClose, topic, context, industryName, subFlowName }: DeepDiveDialogProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const runDeepDive = useCallback(async () => {
    if (started) return;
    setStarted(true);
    setLoading(true);
    setContent("");

    try {
      const { data, error } = await supabase.functions.invoke("deep-dive", {
        body: {
          topic,
          context: context || "",
          industryName: industryName || "",
          subFlowName: subFlowName || "",
        },
      });
      if (error) throw error;
      setContent(data?.report || "No report generated.");
    } catch (e) {
      console.error("Deep dive error:", e);
      setContent("Failed to generate deep-dive report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [topic, context, industryName, subFlowName, started]);

  // Trigger on open
  if (open && !started) {
    runDeepDive();
  }

  const handleClose = () => {
    setStarted(false);
    setContent("");
    onClose();
  };

  const segments = content ? parseBlocks(content) : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono font-bold text-foreground flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            DEEP DIVE: {topic}
          </DialogTitle>
          {industryName && (
            <p className="text-[10px] font-mono text-muted-foreground">
              {industryName}{subFlowName ? ` → ${subFlowName}` : ""} • Full structured intelligence report
            </p>
          )}
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-mono text-muted-foreground">
                Generating comprehensive intelligence report...
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/50">
                Pulling data from all related industries, cross-referencing gaps and trends
              </p>
            </div>
          ) : segments.length > 0 ? (
            <BlockRenderer segments={segments} />
          ) : (
            <p className="text-xs font-mono text-muted-foreground text-center py-10">
              No content available.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
