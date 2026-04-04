import { useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
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
  const [optimisticSaved, setOptimisticSaved] = useState(false);

  if (subLoading || !isPro) return null;

  const onSave = () => {
    const body = getBody().trim();
    if (!body) {
      toast.error("Nothing to save yet.");
      return;
    }
    setOptimisticSaved(true);
    toast.success("Saved to your library — available offline in Saved.");
    void saveIntelItem({ title, subtitle, source, sourceDetail, body }).catch((e) => {
      console.error(e);
      setOptimisticSaved(false);
      toast.error("Could not save. Check browser storage permissions.");
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={`rounded-xl gap-2 font-semibold ${className}`}
      disabled={optimisticSaved}
      onClick={onSave}
    >
      {optimisticSaved ? <BookmarkCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <BookmarkPlus className="h-4 w-4" />}
      {optimisticSaved ? "Saved" : "Save"}
    </Button>
  );
}
