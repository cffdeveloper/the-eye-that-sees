import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeft, LogOut, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { GeoSelector } from "@/components/intel/GeoSelector";
import { useGeoContext } from "@/contexts/GeoContext";
import { useAuth } from "@/contexts/AuthContext";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IndustryNavList } from "@/components/layout/IndustryNavList";
import {
  getAppNavItems,
  appNavIconClass,
  appNavLinkClass,
  isAppNavActive,
} from "@/components/layout/appNavConfig";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { getGeoNavLabel } from "@/lib/geoData";
import { deskNavLabel } from "@/lib/profileDisplayName";

export function TopBar({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  const { isGlobal, geoString, selections } = useGeoContext();
  const { profile, signOut, user } = useAuth();
  const { isPro } = useSubscription();
  const navItems = getAppNavItems(isPro, deskNavLabel(profile, user?.email));
  const location = useLocation();
  const [industriesOpen, setIndustriesOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-50 min-h-[60px] h-[60px] border-b border-border/40 bg-card/70 backdrop-blur-2xl flex items-center px-2.5 sm:px-5 gap-1.5 sm:gap-3 shrink-0"
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
        title="Industries"
        aria-label={sidebarOpen ? "Close industries sidebar" : "Open industries sidebar"}
      >
        {sidebarOpen ? <PanelLeftClose className="w-[18px] h-[18px]" /> : <PanelLeft className="w-[18px] h-[18px]" />}
      </button>

      <Link
        to="/dashboard"
        className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2.5"
      >
        <BrandHexMark size="md" className="shrink-0" />
        <span className="min-w-0 shrink-0">
          <BrandWordmark compact className="!text-sm leading-tight sm:!text-base sm:leading-none" />
        </span>
      </Link>

      <div className="min-w-0 flex-1 md:hidden" aria-hidden />

      {/* Mobile: prominent Industries entry (sidebar toggle is easy to miss on small screens) */}
      <div className="flex shrink-0 items-center md:hidden">
        <button
          type="button"
          onClick={() => setIndustriesOpen(true)}
          className="flex min-w-[4.25rem] touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground active:bg-muted/50"
          aria-label="Browse industries and money flows"
        >
          <Layers className="h-[18px] w-[18px] shrink-0" />
          <span className="text-[9px] font-bold leading-none">Industries</span>
        </button>
      </div>

      <nav
        className="hidden min-w-0 flex-1 items-center justify-center gap-1 px-1 md:flex lg:gap-1.5 lg:px-2"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const active = isAppNavActive(location.pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(appNavLinkClass(active, "header"), "shrink-0")}
            >
              <item.icon className={appNavIconClass(active)} />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Sheet open={industriesOpen} onOpenChange={setIndustriesOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[min(92dvh,800px)] max-h-[92dvh] flex-col rounded-t-2xl border-border/60 bg-card p-0 pt-5"
        >
          <SheetHeader className="shrink-0 space-y-1 px-5 pb-2 text-left">
            <SheetTitle className="font-display text-lg">Industries & money flows</SheetTitle>
            <SheetDescription className="text-left text-sm leading-relaxed">
              Expand any sector for overview and capital lanes — same list as the sidebar.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-6">
            <IndustryNavList showHeading={false} onNavigate={() => setIndustriesOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <span className="hidden max-w-[14rem] truncate text-xs font-medium text-muted-foreground lg:inline shrink-0" title={!isGlobal ? selections.map((s) => s.label).join(", ") : undefined}>
        {getGeoNavLabel(selections)}
      </span>

      <div className="ml-auto flex min-w-0 max-w-[min(100%,calc(100vw-11rem))] shrink items-center gap-1 sm:gap-2 sm:max-w-none md:gap-3">
        <ThemeToggle size="sm" className="shrink-0" />
        {profile?.display_name && (
          <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[160px] font-semibold">
            {profile.display_name}
          </span>
        )}
        <GeoSelector />
        <button
          onClick={signOut}
          className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
          title="Sign out"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
      </div>
    </motion.header>
  );
}
