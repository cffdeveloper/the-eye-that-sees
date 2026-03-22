import { Link, useLocation } from "react-router-dom";
import { industries, subFlowIdToPathSegment } from "@/lib/industryData";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  open: boolean;
  /** When true, sidebar is fixed over content (mobile drawer). */
  overlay?: boolean;
  /** Called after navigating (closes mobile drawer). */
  onNavigate?: () => void;
};

export function Sidebar({ open, overlay, onNavigate }: SidebarProps) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  const nav = () => onNavigate?.();

  return (
    <aside
      className={cn(
        "border-r border-border/40 bg-sidebar overflow-y-auto overscroll-contain",
        overlay
          ? "fixed left-0 top-[60px] z-40 h-[calc(100dvh-60px)] w-[min(18rem,88vw)] shadow-2xl transition-transform duration-200"
          : "w-60 shrink-0",
      )}
    >
      <div className="px-4 py-3 pt-4">
        <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Industries</p>
      </div>

      <div className="space-y-0.5 px-2 pb-8">
        {industries.map((ind) => {
          const isActive = location.pathname.startsWith(`/industry/${ind.slug}`);
          const isExpanded = expanded === ind.slug || isActive;

          return (
            <div key={ind.slug}>
              <button
                type="button"
                onClick={() => setExpanded(isExpanded && !isActive ? null : ind.slug)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200",
                  isActive
                    ? "bg-brand-orange/[0.06] text-foreground font-bold"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                )}
              >
                <span className="text-base">{ind.icon}</span>
                <span className="flex-1 truncate">{ind.name}</span>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-40" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                )}
              </button>

              {isExpanded && (
                <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-border/40 pl-3">
                  <Link
                    to={`/industry/${ind.slug}`}
                    onClick={nav}
                    className={cn(
                      "block rounded-xl px-3 py-2 text-sm transition-all duration-200",
                      location.pathname === `/industry/${ind.slug}`
                        ? "bg-primary/[0.06] font-semibold text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Overview
                  </Link>
                  {ind.subFlows.map((sf) => {
                    const flowPath = `/industry/${ind.slug}/${subFlowIdToPathSegment(sf.id)}`;
                    return (
                    <Link
                      key={sf.id}
                      to={flowPath}
                      onClick={nav}
                      className={cn(
                        "block truncate rounded-xl px-3 py-2 text-xs transition-all duration-200",
                        location.pathname === flowPath
                          ? "bg-brand-orange/[0.06] font-semibold text-brand-orange"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {sf.shortName}
                    </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
