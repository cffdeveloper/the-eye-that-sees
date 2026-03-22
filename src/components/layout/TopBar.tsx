import { PanelLeftClose, PanelLeft, Activity, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GeoSelector } from "@/components/intel/GeoSelector";
import { useGeoContext } from "@/contexts/GeoContext";
import { useAuth } from "@/contexts/AuthContext";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";

export function TopBar({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  const { isGlobal, geoString } = useGeoContext();
  const { profile, signOut } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-12 h-12 border-b border-border/60 bg-card/70 backdrop-blur-sm flex items-center px-3 gap-3 shrink-0"
    >
      <button onClick={toggleSidebar} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
        {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
      </button>

      <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
        <BrandHexMark size="sm" />
        <span className="text-[13px] sm:text-[0.9rem] truncate">
          <BrandWordmark />
        </span>
      </Link>

      <span className="text-xs text-muted-foreground hidden md:block">
        {isGlobal ? "Global scope" : `Region · ${geoString}`}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {profile?.display_name && (
          <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[140px]">
            {profile.display_name}
          </span>
        )}
        <ThemeToggle />
        <GeoSelector />
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 border border-border/60">
          <span className="text-[10px] text-muted-foreground">20 sectors</span>
          <span className="w-px h-3 bg-border/60" />
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] text-brand-orange font-semibold">Live</span>
        </div>
        <button
          onClick={signOut}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.header>
  );
}
