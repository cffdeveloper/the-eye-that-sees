import { useState } from "react";
import { BookmarkPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { saveIntelItem, type SavedContentSource } from "@/lib/savedIntelStorage";
import { toast } from "sonner";

type Props = {
  title: string;
  subtitle?: string;
  source: SavedContentSource;
  sourceDetail?: string;
  getBody: () => string;
  className?: string;
  size?: "sm" | "default";
};

/** Pro only — saves a snapshot to on-device library (IndexedDB, offline-friendly). */
export function SaveIntelButton({
  title,
  subtitle,
  source,
  sourceDetail,
  getBody,
  className = "",
  size = "default",
}: Props) {
  const { isPro, loading: subLoading } = useSubscription();
  const [saving, setSaving] = useState(false);

  if (subLoading || !isPro) return null;

  const onSave = async () => {
    const body = getBody().trim();
    if (!body) {
      toast.error("Nothing to save yet.");
      return;
    }
    setSaving(true);
    try {
      await saveIntelItem({ title, subtitle, source, sourceDetail, body });
      toast.success("Saved to your library — available offline in Saved.");
    } catch (e) {
      console.error(e);
      toast.error("Could not save. Check browser storage permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={`rounded-xl gap-2 font-semibold ${className}`}
      disabled={saving}
      onClick={onSave}
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
      {saving ? "Saving…" : "Save"}
    </Button>
  );
}
