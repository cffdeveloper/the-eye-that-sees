import { Link, useLocation } from "react-router-dom";
import { getAppNavItems, isAppNavActive } from "@/components/layout/appNavConfig";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { deskNavLabel } from "@/lib/profileDisplayName";
import { cn } from "@/lib/utils";

/** Mobile-only: primary app destinations in one row (laptop nav stays in TopBar). */
export function MobileBottomNav() {
  const location = useLocation();
  const { isPro } = useSubscription();
  const { profile, user } = useAuth();
  const navItems = getAppNavItems(isPro, deskNavLabel(profile, user?.email));
  const cols = navItems.length;
  const gridCols =
    cols >= 7 ? "grid-cols-7" : cols >= 6 ? "grid-cols-6" : "grid-cols-5";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[38] border-t border-border/50 bg-card/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      <div
        className={`mx-auto grid max-w-lg gap-0 px-0.5 pt-1 ${gridCols}`}
      >
        {navItems.map((item) => {
          const active = isAppNavActive(location.pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-[52px] touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-center transition-colors active:bg-muted/40",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-[22px] w-[22px] shrink-0", active ? "text-primary" : "")} />
              <span
                className={cn(
                  "max-w-[4.5rem] text-[9px] font-semibold leading-tight sm:text-[10px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
