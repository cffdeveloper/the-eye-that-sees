import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GeoSelector } from "@/components/intel/GeoSelector";
import { useGeoContext } from "@/contexts/GeoContext";
import { useAuth } from "@/contexts/AuthContext";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopBar({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  const { isGlobal, geoString } = useGeoContext();
  const { profile, signOut } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-50 min-h-[60px] h-[60px] border-b border-border/40 bg-card/70 backdrop-blur-2xl flex items-center px-2.5 sm:px-5 gap-2 sm:gap-4 shrink-0"
    >
      <button onClick={toggleSidebar} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
        {sidebarOpen ? <PanelLeftClose className="w-[18px] h-[18px]" /> : <PanelLeft className="w-[18px] h-[18px]" />}
      </button>

      <Link to="/dashboard" className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        <BrandHexMark size="sm" />
        <span className="hidden min-w-0 truncate text-sm sm:block">
          <BrandWordmark compact />
        </span>
      </Link>

      <span className="hidden text-xs font-medium text-muted-foreground lg:inline">
        {isGlobal ? "Global" : geoString}
      </span>

      <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-3">
        <ThemeToggle size="sm" />
        {profile?.display_name && (
          <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[160px] font-semibold">
            {profile.display_name}
          </span>
        )}
        <GeoSelector />
        <button
          onClick={signOut}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
          title="Sign out"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
      </div>
    </motion.header>
  );
}
