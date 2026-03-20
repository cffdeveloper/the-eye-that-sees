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
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/intel", label: "Live Feed", icon: Radio },
    { to: "/cross-intel", label: "Cross-Intel", icon: Network },
    { to: "/custom-intel", label: "Intel Lab", icon: FlaskConical },
  ];

  return (
    <aside className="w-52 shrink-0 border-r border-border/50 bg-sidebar overflow-y-auto">
      <div className="p-1.5 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-colors",
              location.pathname === item.to
                ? "bg-primary/10 text-primary font-semibold"
                : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="w-3 h-3" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="px-2 py-1">
        <p className="terminal-header text-[8px] px-2 mb-0.5">INDUSTRIES</p>
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
                  "w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-colors text-left",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
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
                      "block px-1.5 py-0.5 rounded text-[10px] transition-colors",
                      location.pathname === `/industry/${ind.slug}`
                        ? "text-primary bg-primary/5"
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
                        "block px-1.5 py-0.5 rounded text-[10px] transition-colors truncate",
                        location.pathname === `/industry/${ind.slug}/${sf.id}`
                          ? "text-primary bg-primary/5"
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
