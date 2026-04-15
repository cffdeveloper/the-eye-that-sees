import { Link } from "react-router-dom";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { motion } from "framer-motion";
import { GeoSelector } from "@/components/intel/GeoSelector";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { assistantHomePath } from "@/lib/assistantBranding";
import { workspacePaddingX } from "@/lib/workspaceLayout";
import { cn } from "@/lib/utils";

export function TopBar({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative z-50 min-h-[60px] h-[60px] border-b border-border/40 bg-card/70 backdrop-blur-2xl flex items-center gap-2 sm:gap-3 shrink-0",
        workspacePaddingX,
      )}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
        title="Open sidebar"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <PanelLeftClose className="w-[18px] h-[18px]" /> : <PanelLeft className="w-[18px] h-[18px]" />}
      </button>

      <Link to={assistantHomePath} className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2.5">
        <BrandHexMark size="md" className="shrink-0" />
        <span className="min-w-0 shrink-0">
          <BrandWordmark compact className="!text-sm leading-tight sm:!text-base sm:leading-none" />
        </span>
      </Link>

      <div className="min-w-0 flex-1" aria-hidden />

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
        <ThemeToggle size="sm" className="shrink-0" />
        <GeoSelector />
      </div>
    </motion.header>
  );
}
