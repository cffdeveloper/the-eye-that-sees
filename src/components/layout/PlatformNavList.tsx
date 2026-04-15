import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getAppNavItems, appNavIconClass, appNavLinkClass, isAppNavActive } from "@/components/layout/appNavConfig";
import { workspacePaddingX } from "@/lib/workspaceLayout";

type PlatformNavListProps = {
  onNavigate?: () => void;
  className?: string;
};

/** Primary workspace navigation — four destinations only. */
export function PlatformNavList({ onNavigate, className }: PlatformNavListProps) {
  const location = useLocation();
  const navItems = getAppNavItems();

  return (
    <nav className={cn(workspacePaddingX, "pt-3 pb-4", className)} aria-label="Workspace">
      <div className="pb-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Workspace</p>
      </div>
      <div className="space-y-0.5">
        {navItems.map((item) => {
          const active = isAppNavActive(location.pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => onNavigate?.()}
              className={cn(appNavLinkClass(active, "sidebar"))}
            >
              <item.icon className={appNavIconClass(active)} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
