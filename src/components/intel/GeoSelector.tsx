import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGeoContext } from "@/contexts/GeoContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CONTINENTS, COUNTRIES, getSubRegions, GeoOption, getGeoLabel } from "@/lib/geoData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, X, ChevronDown, MapPin, Search, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TAB_LABELS: Record<"continent" | "country" | "sub", string> = {
  continent: "Continents",
  country: "Countries",
  sub: "Sub-regions",
};

export function GeoSelector() {
  const { selections, addSelection, removeSelection, clearSelections } = useGeoContext();
  const { isPro, loading: subscriptionLoading } = useSubscription();
  const isSm = useMediaQuery("(min-width: 640px)");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"continent" | "country" | "sub">("country");

  const selectedValues = useMemo(() => new Set(selections.map((s) => s.value)), [selections]);

  const selectedCountries = useMemo(() => selections.filter((s) => s.type === "country"), [selections]);
  const subRegions = useMemo(
    () => selectedCountries.flatMap((c) => getSubRegions(c.value)),
    [selectedCountries],
  );

  const tabs = useMemo(() => {
    const base: ("continent" | "country" | "sub")[] = ["continent", "country"];
    if (subRegions.length > 0) base.push("sub");
    return base;
  }, [subRegions.length]);

  useEffect(() => {
    if (!open) return;
    if (tab === "sub" && subRegions.length === 0) setTab("country");
  }, [open, tab, subRegions.length]);

  const filterOptions = (options: GeoOption[]) => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  };

  const toggle = (opt: GeoOption) => {
    if (selectedValues.has(opt.value)) {
      removeSelection(opt.value);
    } else {
      addSelection(opt);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={!isSm}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex max-w-[min(100vw-7rem,16rem)] min-h-11 touch-manipulation items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition-all sm:max-w-[220px] sm:min-h-0 sm:px-3",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            selections.length > 0
              ? "border-primary/45 bg-primary/[0.08] text-primary shadow-sm"
              : "border-border/60 bg-card/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:border-border hover:bg-card hover:text-foreground",
          )}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`Region: ${getGeoLabel(selections)}. Open to change.`}
        >
          <Globe className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <span className="min-w-0 flex-1 truncate font-medium">{getGeoLabel(selections)}</span>
          {selections.length > 0 && (
            <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-primary/20 px-1 text-[10px] font-bold tabular-nums text-primary">
              {selections.length}
            </span>
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-200", open && "rotate-180")} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={isSm ? "end" : "center"}
        side="bottom"
        sideOffset={isSm ? 10 : 8}
        collisionPadding={
          isSm
            ? 16
            : { top: 12, right: 10, bottom: 20, left: 10 }
        }
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/98 p-0 shadow-2xl backdrop-blur-xl",
          "z-[200] data-[state=open]:animate-in data-[state=closed]:animate-out",
          /* Mobile: near full-width sheet, cap height with dynamic viewport + safe areas */
          "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] max-h-[min(88dvh,calc(100dvh-4.5rem-env(safe-area-inset-bottom)))]",
          "sm:max-h-[min(90vh,44rem)] sm:w-[min(calc(100vw-1.25rem),23rem)] sm:max-w-none",
        )}
      >
        {/* Mobile sheet header — title + close (easier than hunting Done) */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 px-3 py-2.5 sm:hidden">
          <span className="text-sm font-semibold tracking-tight text-foreground">Region scope</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted"
            aria-label="Close region picker"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tier strip — correct view for Pro vs free while subscription loads */}
        <div className="shrink-0 border-b border-border/50 px-3 py-2.5 sm:py-2.5">
          {subscriptionLoading ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              <span>Checking subscription…</span>
            </div>
          ) : isPro ? (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span>Pro — full regional intel & feeds</span>
            </div>
          ) : (
            <p className="text-[11px] leading-snug text-muted-foreground">
              Free plan — regions still apply to your view.{" "}
              <Link to="/profile" className="font-semibold text-primary underline-offset-2 hover:underline" onClick={() => setOpen(false)}>
                Upgrade to Pro
              </Link>{" "}
              for news, social intel, and deep analysis.
            </p>
          )}
        </div>

        <div className="shrink-0 border-b border-border/40 p-2.5 sm:p-2.5">
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-border/50 bg-muted/25 px-3 py-2 sm:min-h-0 sm:px-2.5 sm:py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search locations…"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-xs"
              autoComplete="off"
              autoFocus={isSm}
            />
            {search && (
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:h-auto sm:w-auto sm:p-1"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4 sm:h-3 sm:w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Selected chips — inside panel only (no broken absolute layout) */}
        {selections.length > 0 && (
          <div className="max-h-[min(28dvh,7.5rem)] shrink-0 overflow-y-auto overscroll-y-contain border-b border-border/40 px-2.5 py-2 touch-pan-y">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-1.5">Selected</p>
            <div className="flex flex-wrap gap-2 sm:gap-1.5">
              {selections.map((s) => (
                <span
                  key={s.value}
                  className="inline-flex max-w-full min-h-9 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary sm:min-h-0 sm:gap-1 sm:px-2 sm:py-1 sm:text-[10px]"
                >
                  <span className="truncate">{s.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelection(s.value);
                    }}
                    className="flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-md text-primary hover:bg-primary/20 hover:text-destructive sm:h-auto sm:w-auto sm:p-0.5"
                    aria-label={`Remove ${s.label}`}
                  >
                    <X className="h-4 w-4 sm:h-3 sm:w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex shrink-0 border-b border-border/50">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              title={t === "sub" ? "States, counties, provinces (where available)" : undefined}
              onClick={() => setTab(t)}
              className={cn(
                "min-h-12 flex-1 touch-manipulation px-1 py-2 text-[11px] font-semibold uppercase leading-tight tracking-wide transition-colors active:bg-muted/40 sm:min-h-[2.75rem] sm:text-[11px]",
                tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <ScrollArea className="h-[min(52dvh,22rem)] min-h-[11rem] w-full sm:h-[min(42vh,300px)] sm:min-h-0">
          <div className="space-y-0.5 p-2 pr-3 pb-3 sm:pb-2">
            {tab === "continent" &&
              filterOptions(CONTINENTS).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={cn(
                    "flex min-h-12 w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors active:bg-muted/60 sm:min-h-0 sm:gap-2 sm:rounded-lg sm:px-2.5 sm:py-2 sm:text-xs",
                    selectedValues.has(opt.value) ? "bg-primary/12 font-medium text-primary" : "text-foreground hover:bg-muted/50",
                  )}
                >
                  <MapPin className="h-4 w-4 shrink-0 opacity-70 sm:h-3.5 sm:w-3.5" />
                  <span className="min-w-0 flex-1">{opt.label}</span>
                  {selectedValues.has(opt.value) && <span className="text-sm text-primary sm:text-[10px]">✓</span>}
                </button>
              ))}

            {tab === "country" &&
              (() => {
                const grouped: Record<string, GeoOption[]> = {};
                for (const c of filterOptions(COUNTRIES)) {
                  const parent = c.parent || "other";
                  if (!grouped[parent]) grouped[parent] = [];
                  grouped[parent].push(c);
                }
                return Object.entries(grouped).map(([continent, countries]) => (
                  <div key={continent} className="pb-2">
                    <p className="sticky top-0 z-[1] bg-card/95 px-1.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                      {CONTINENTS.find((c) => c.value === continent)?.label || continent}
                    </p>
                    {countries.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={cn(
                          "flex min-h-12 w-full touch-manipulation items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors active:bg-muted/60 sm:min-h-0 sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs",
                          selectedValues.has(opt.value) ? "bg-primary/12 font-medium text-primary" : "text-foreground hover:bg-muted/50",
                        )}
                      >
                        <span className="w-8 shrink-0 font-mono text-[11px] text-muted-foreground sm:w-7 sm:text-[10px]">{opt.value}</span>
                        <span className="min-w-0 flex-1">{opt.label}</span>
                        {selectedValues.has(opt.value) && <span className="text-sm text-primary sm:text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                ));
              })()}

            {tab === "sub" && subRegions.length > 0 &&
              filterOptions(subRegions).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={cn(
                    "flex min-h-12 w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors active:bg-muted/60 sm:min-h-0 sm:gap-2 sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-xs",
                    selectedValues.has(opt.value) ? "bg-primary/12 font-medium text-primary" : "text-foreground hover:bg-muted/50",
                  )}
                >
                  <MapPin className="h-4 w-4 shrink-0 opacity-70 sm:h-3.5 sm:w-3.5" />
                  <span className="min-w-0 flex-1">{opt.label}</span>
                  {selectedValues.has(opt.value) && <span className="text-sm text-primary sm:text-[10px]">✓</span>}
                </button>
              ))}

            {tab === "sub" && subRegions.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                Select one or more countries first to pick states or provinces where available.
              </p>
            )}
          </div>
        </ScrollArea>

        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-2 border-t border-border/50 bg-muted/15 px-3 py-3 sm:py-2.5",
            "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:pb-2.5",
          )}
        >
          <span className="min-w-0 text-xs font-medium tabular-nums text-muted-foreground sm:text-[10px]">
            {selections.length} selected
            {selections.length === 0 && " · global scope"}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {selections.length > 0 && (
              <button
                type="button"
                onClick={() => clearSelections()}
                className="min-h-11 touch-manipulation rounded-xl px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 active:bg-destructive/15 sm:min-h-0 sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-[10px]"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-11 touch-manipulation rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80 sm:min-h-0 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-[10px]"
            >
              Done
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
