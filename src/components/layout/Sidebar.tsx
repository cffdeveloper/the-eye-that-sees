import { Link, useLocation } from "react-router-dom";
import { industries } from "@/lib/industryData";
import { LayoutDashboard, Radio, Network, ChevronDown, ChevronRight, FlaskConical } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Sidebar({ open }: { open: boolean }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/intel", label: "Live Feed", icon: Radio },
    { to: "/cross-intel", label: "Cross-Intel", icon: Network },
    { to: "/custom-intel", label: "Intel Lab", icon: FlaskConical },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-border/60 bg-sidebar overflow-y-auto">
      <div className="p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors border-l-2",
              location.pathname === item.to
                ? "border-primary bg-primary/5 text-foreground font-medium"
                : "border-transparent text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className={cn("w-4 h-4 shrink-0", location.pathname === item.to ? "text-primary" : "text-muted-foreground")} />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Industries</p>
      </div>

      <div className="px-1.5 space-y-0.5 pb-4">
        {industries.map((ind) => {
          const isActive = location.pathname.startsWith(`/industry/${ind.slug}`);
          const isExpanded = expanded === ind.slug || isActive;

          return (
            <div key={ind.slug}>
              <button
                onClick={() => setExpanded(isExpanded && !isActive ? null : ind.slug)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left",
                  isActive
                    ? "bg-brand-orange/10 text-foreground font-medium border-l-2 border-brand-orange -ml-px pl-[7px]"
                    : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent border-l-2 border-transparent"
                )}
              >
                <span className="text-sm">{ind.icon}</span>
                <span className="flex-1 truncate">{ind.name}</span>
                {isExpanded ? <ChevronDown className="w-2.5 h-2.5 shrink-0 opacity-50" /> : <ChevronRight className="w-2.5 h-2.5 shrink-0 opacity-50" />}
              </button>

              {isExpanded && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border/30 pl-1.5">
                  <Link
                    to={`/industry/${ind.slug}`}
                    className={cn(
                      "block px-2 py-1 rounded-md text-xs transition-colors",
                      location.pathname === `/industry/${ind.slug}`
                        ? "text-primary bg-primary/8 font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Overview
                  </Link>
                  {ind.subFlows.map((sf) => (
                    <Link
                      key={sf.id}
                      to={`/industry/${ind.slug}/${sf.id}`}
                      className={cn(
                        "block px-2 py-1 rounded-md text-[11px] transition-colors truncate",
                        location.pathname === `/industry/${ind.slug}/${sf.id}`
                          ? "text-brand-orange font-medium bg-brand-orange/10"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {sf.shortName}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
