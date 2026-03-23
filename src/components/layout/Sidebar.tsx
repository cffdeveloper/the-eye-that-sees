import { cn } from "@/lib/utils";
import { IndustryNavList } from "@/components/layout/IndustryNavList";

type SidebarProps = {
  open: boolean;
  /** When true, sidebar is fixed over content (mobile drawer). */
  overlay?: boolean;
  /** Called after navigating (closes mobile drawer). */
  onNavigate?: () => void;
};

export function Sidebar({ open, overlay, onNavigate }: SidebarProps) {
  if (!open) return null;

  return (
    <aside
      className={cn(
        "border-r border-border/40 bg-sidebar overflow-y-auto overscroll-contain",
        overlay
          ? "fixed left-0 top-[60px] z-40 h-[calc(100dvh-60px)] w-[min(18rem,88vw)] shadow-2xl transition-transform duration-200"
          : "w-60 shrink-0",
      )}
    >
      <IndustryNavList onNavigate={onNavigate} className="pb-8" />
    </aside>
  );
}
