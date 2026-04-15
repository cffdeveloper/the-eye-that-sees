import type { LucideIcon } from "lucide-react";
import { CalendarDays, BookOpen, Lightbulb, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { assistantHomePath } from "@/lib/assistantBranding";

export type AppNavItem = { to: string; label: string; icon: LucideIcon };

export function getAppNavItems(): AppNavItem[] {
  return [
    { to: "/events", label: "Events", icon: CalendarDays },
    { to: "/reads", label: "Reads", icon: BookOpen },
    { to: assistantHomePath, label: "Opportunities", icon: Lightbulb },
    { to: "/saved", label: "Saved", icon: Bookmark },
  ];
}

export function isAppNavActive(pathname: string, to: string): boolean {
  if (to === "/events") return pathname === "/events" || pathname.startsWith("/events/");
  if (to === "/reads") return pathname === "/reads" || pathname.startsWith("/reads/");
  if (to === "/saved") return pathname === "/saved" || pathname.startsWith("/saved/");
  if (to === assistantHomePath) return pathname === assistantHomePath || pathname.startsWith(`${assistantHomePath}/`);
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function appNavLinkClass(active: boolean, variant: "sidebar" | "header" = "sidebar"): string {
  if (variant === "header") {
    return cn(
      "inline-flex items-center gap-2 rounded-2xl font-semibold transition-all duration-200",
      "text-[13px] lg:text-sm",
      "px-3 py-2 lg:px-4 lg:py-2.5",
      active
        ? "bg-primary/[0.08] text-foreground shadow-sm ring-1 ring-primary/15"
        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
    );
  }
  return cn(
    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
    active ? "bg-primary/[0.06] text-foreground font-bold shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
  );
}

export function appNavIconClass(active: boolean): string {
  return cn("w-[18px] h-[18px] shrink-0", active ? "text-primary" : "");
}
