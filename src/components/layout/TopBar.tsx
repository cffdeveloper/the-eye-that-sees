import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[52px] h-[52px] border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4 gap-3 shrink-0"
    >
      <button onClick={toggleSidebar} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </button>

      <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
        <BrandHexMark size="sm" />
        <span className="text-sm truncate">
          <BrandWordmark compact />
        </span>
      </Link>

      <span className="text-xs text-muted-foreground hidden md:block">
        {isGlobal ? "Global" : geoString}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {profile?.display_name && (
          <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[140px] font-medium">
            {profile.display_name}
          </span>
        )}
        <ThemeToggle />
        <GeoSelector />
        <button
          onClick={signOut}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </motion.header>
  );
}
