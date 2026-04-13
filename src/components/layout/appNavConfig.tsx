import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Radio, Network, FlaskConical, UserCircle, Bookmark, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { assistantHomePath } from "@/lib/assistantBranding";

export type AppNavItem = { to: string; label: string; icon: LucideIcon };

function buildBaseItems(deskNavLabel: string): AppNavItem[] {
  return [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/intel", label: "Live Feed", icon: Radio },
    { to: "/cross-intel", label: "Cross-Intel", icon: Network },
    { to: "/custom-intel", label: "Infinity Lab", icon: FlaskConical },
    { to: assistantHomePath, label: deskNavLabel, icon: Bot },
    { to: "/profile", label: "My Profile", icon: UserCircle },
  ];
}

/** `isPro` kept for call-site compatibility; Saved is always available (open-source build). */
export function getAppNavItems(_isPro?: boolean, deskNavLabel = "My desk"): AppNavItem[] {
  const items = buildBaseItems(deskNavLabel);
  const profile = items[items.length - 1];
  const rest = items.slice(0, -1);
  return [...rest, { to: "/saved", label: "Saved", icon: Bookmark }, profile];
}

export function isAppNavActive(pathname: string, to: string): boolean {
  if (to === "/dashboard") return pathname === "/dashboard";
  if (to === "/saved") return pathname === "/saved";
  if (to === assistantHomePath) return pathname === assistantHomePath || pathname.startsWith(`${assistantHomePath}/`);
  if (to === "/profile") return pathname === "/profile" || pathname.startsWith("/profile/");
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Shared styles — matches sidebar link look for active / default states. */
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
    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200",
    active ? "bg-primary/[0.06] text-foreground font-bold shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
  );
}

export function appNavIconClass(active: boolean): string {
  return cn("w-[18px] h-[18px] shrink-0", active ? "text-primary" : "");
}
