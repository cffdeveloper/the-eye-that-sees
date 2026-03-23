import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadIntelBriefPdf } from "@/lib/exportIntelBriefPdf";
import { toast } from "sonner";

type Props = {
  /** Element whose rendered content should be exported (same branded PDF as trial export). */
  contentRootId: string;
  documentTitle?: string;
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "secondary" | "ghost";
  label?: string;
};

export function DownloadIntelPdfButton({
  contentRootId,
  documentTitle = "Intelligence Brief",
  className = "",
  size = "default",
  variant = "outline",
  label = "Download PDF",
}: Props) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const el = document.getElementById(contentRootId);
    if (!el) {
      toast.error("Nothing to export yet.");
      return;
    }
    setBusy(true);
    try {
      await downloadIntelBriefPdf({ contentElement: el, documentTitle });
      toast.success("PDF downloaded.");
    } catch (e) {
      console.error(e);
      toast.error("Could not create PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`rounded-xl gap-2 font-semibold ${className}`}
      disabled={busy}
      onClick={run}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {busy ? "Preparing…" : label}
    </Button>
  );
}
