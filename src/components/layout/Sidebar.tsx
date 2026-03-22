import { Link, useLocation } from "react-router-dom";
import { industries } from "@/lib/industryData";
import { LayoutDashboard, Radio, Network, ChevronDown, ChevronRight, FlaskConical, UserCircle } from "lucide-react";
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
    { to: "/profile", label: "My Profile", icon: UserCircle },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-border/40 bg-sidebar overflow-y-auto">
      <div className="p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200",
              location.pathname === item.to
                ? "bg-primary/[0.06] text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            <item.icon className={cn("w-[18px] h-[18px] shrink-0", location.pathname === item.to ? "text-primary" : "")} />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 px-1">Industries</p>
      </div>

      <div className="px-2 space-y-0.5 pb-6">
        {industries.map((ind) => {
          const isActive = location.pathname.startsWith(`/industry/${ind.slug}`);
          const isExpanded = expanded === ind.slug || isActive;

          return (
            <div key={ind.slug}>
              <button
                onClick={() => setExpanded(isExpanded && !isActive ? null : ind.slug)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm transition-all text-left duration-200",
                  isActive
                    ? "bg-brand-orange/[0.06] text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <span className="text-base">{ind.icon}</span>
                <span className="flex-1 truncate">{ind.name}</span>
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-40" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />}
              </button>

              {isExpanded && (
                <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-border/40 pl-3">
                  <Link
                    to={`/industry/${ind.slug}`}
                    className={cn(
                      "block px-3 py-2 rounded-xl text-sm transition-all duration-200",
                      location.pathname === `/industry/${ind.slug}`
                        ? "text-primary bg-primary/[0.06] font-semibold"
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
                        "block px-3 py-2 rounded-xl text-xs transition-all duration-200 truncate",
                        location.pathname === `/industry/${ind.slug}/${sf.id}`
                          ? "text-brand-orange font-semibold bg-brand-orange/[0.06]"
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
