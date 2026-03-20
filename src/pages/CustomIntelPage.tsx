import { useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGeoContext } from "@/contexts/GeoContext";
import { industries } from "@/lib/industryData";
import { allPickedOptions, buildSubFlowKey, findPickedByKey, type PickedSubFlow } from "@/lib/customIntelTypes";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import { streamChat } from "@/lib/streaming";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Shuffle, ArrowRight, Send, RefreshCw, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

type Scope = { pool: Set<string>; primary: Set<string>; secondary: Set<string> };

function cloneScope(s: Scope): Scope {
  return {
    pool: new Set(s.pool),
    primary: new Set(s.primary),
    secondary: new Set(s.secondary),
  };
}

function moveKey(key: string, scope: Scope, to: "pool" | "primary" | "secondary") {
  scope.pool.delete(key);
  scope.primary.delete(key);
  scope.secondary.delete(key);
  if (to === "pool") scope.pool.add(key);
  if (to === "primary") scope.primary.add(key);
  if (to === "secondary") scope.secondary.add(key);
}

export default function CustomIntelPage() {
  const { geoString, geoScopeId, isGlobal } = useGeoContext();

  const options = useMemo(() => allPickedOptions(), []);
  const byIndustry = useMemo(() => {
    const m = new Map<string, PickedSubFlow[]>();
    for (const p of options) {
      const arr = m.get(p.industrySlug) || [];
      arr.push(p);
      m.set(p.industrySlug, arr);
    }
    return m;
  }, [options]);

  const [industrySlug, setIndustrySlug] = useState(industries[0]?.slug || "");
  const subOptions = byIndustry.get(industrySlug) || [];

  const [scope, setScope] = useState<Scope>(() => ({
    pool: new Set(),
    primary: new Set(),
    secondary: new Set(),
  }));
  const { pool, primary, secondary } = scope;

  const [freeText, setFreeText] = useState("");
  const [freeTextMode, setFreeTextMode] = useState<"primary" | "generic">("primary");

  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStreaming, setChatStreaming] = useState("");

  const updateScope = useCallback((fn: (draft: Scope) => void) => {
    setScope((prev) => {
      const next = cloneScope(prev);
      fn(next);
      return next;
    });
  }, []);

  const addToPool = useCallback(() => {
    if (!industrySlug || !subOptions[0]) return;
    const first = subOptions[0];
    const key = buildSubFlowKey(industrySlug, first.subFlow.id);
    updateScope((d) => {
      if (d.primary.has(key) || d.secondary.has(key)) return;
      d.pool.add(key);
    });
  }, [industrySlug, subOptions, updateScope]);

  const addSpecificToPool = useCallback(
    (key: string) => {
      updateScope((d) => {
        if (d.primary.has(key) || d.secondary.has(key)) return;
        d.pool.add(key);
      });
    },
    [updateScope],
  );

  const shuffleRoles = useCallback(() => {
    const all = [...pool, ...primary, ...secondary];
    if (all.length === 0) return;
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const nPri = Math.max(1, Math.min(3, Math.ceil(shuffled.length / 3)));
    const pri = new Set(shuffled.slice(0, nPri));
    const sec = new Set(shuffled.slice(nPri));
    setScope({ pool: new Set(), primary: pri, secondary: sec });
  }, [pool, primary, secondary]);

  const runIntel = useCallback(async () => {
    const selectedCount = pool.size + primary.size + secondary.size;
    if (!freeText.trim() && selectedCount === 0) {
      setError("Add subcategories to pool/primary/secondary or enter text context.");
      return;
    }
    setError(null);
    setLoading(true);
    setReport("");
    setChatMessages([]);

    const toPayload = (keys: Set<string>) =>
      [...keys]
        .map((k) => findPickedByKey(k))
        .filter(Boolean)
        .map((p) => ({
          industryName: p!.industryName,
          subFlowName: p!.subFlow.name,
          moneyFlow: p!.subFlow.moneyFlow,
        }));

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("custom-intel", {
        body: {
          primarySubflows: toPayload(primary),
          // Pool items are treated as unprioritized context (secondary) unless promoted.
          secondarySubflows: toPayload(new Set([...secondary, ...pool])),
          freeTextPrimary: freeText.trim(),
          freeTextMode,
          geoContext: isGlobal ? "global" : geoString,
          geoScopeId: geoScopeId || "global",
        },
      });
      if (fnErr) throw fnErr;
      const r = (data as { report?: string; error?: string })?.report || "";
      if (!r && (data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setReport(r || "No report body returned.");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [freeText, freeTextMode, pool, primary, secondary, geoString, geoScopeId, isGlobal]);

  const sendFollowUp = useCallback(() => {
    const q = chatInput.trim();
    if (!q || !report) return;
    setChatInput("");

    const scopeSummary = [
      `Geo: ${isGlobal ? "global" : geoString}`,
      `Primary subflows: ${[...primary].map((k) => findPickedByKey(k)?.subFlow.shortName).filter(Boolean).join(", ") || "—"}`,
      `Secondary subflows: ${[...secondary].map((k) => findPickedByKey(k)?.subFlow.shortName).filter(Boolean).join(", ") || "—"}`,
      freeText.trim() ? `Text context (${freeTextMode}): ${freeText.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const systemPreamble = `You are continuing a custom Maverick intel session.

SCOPE:
${scopeSummary}

FULL PRIOR BRIEF (ground truth for this session):
---
${report.slice(0, 120_000)}
---

Answer the user's follow-up with the same structured block style when analytical. Stay anchored to primary vs secondary linkage.`;

    setChatMessages((prev) => [...prev, { role: "user", content: q }]);

    let acc = "";
    setChatStreaming("");

    streamChat({
      mode: "research",
      messages: [{ role: "user", content: `${systemPreamble}\n\n---\nUSER FOLLOW-UP:\n${q}` }],
      onDelta: (t) => {
        acc += t;
        setChatStreaming(acc);
      },
      onDone: () => {
        setChatMessages((prev) => [...prev, { role: "assistant", content: acc }]);
        setChatStreaming("");
      },
      onError: (err) => {
        setChatMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err || "failed"}` }]);
        setChatStreaming("");
      },
    });
  }, [chatInput, report, isGlobal, geoString, primary, secondary, freeText, freeTextMode]);

  const segments = report ? parseBlocks(report) : [];

  const chip = (key: string) => {
    const p = findPickedByKey(key);
    if (!p) return null;
    return (
      <div
        key={key}
        className="flex items-center gap-1 flex-wrap px-2 py-1 rounded border border-border/60 bg-muted/20 text-[10px] font-mono"
      >
        <span className="text-muted-foreground truncate max-w-[140px]">{p.industryName.split(" ")[0]}</span>
        <span className="text-primary">→</span>
        <span className="text-foreground">{p.subFlow.shortName}</span>
        <button
          type="button"
          className="text-[9px] text-primary hover:underline"
          onClick={() => updateScope((d) => moveKey(key, d, "primary"))}
        >
          Pri
        </button>
        <button
          type="button"
          className="text-[9px] text-accent hover:underline"
          onClick={() => updateScope((d) => moveKey(key, d, "secondary"))}
        >
          Sec
        </button>
        <button
          type="button"
          onClick={() => updateScope((d) => moveKey(key, d, "pool"))}
          className="opacity-50 hover:opacity-100"
        >
          pool
        </button>
        <button
          type="button"
          onClick={() =>
            updateScope((d) => {
              d.pool.delete(key);
              d.primary.delete(key);
              d.secondary.delete(key);
            })
          }
          className="opacity-60 hover:opacity-100"
          aria-label="Remove from custom scope"
          title="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-20">
      <div className="glass-panel p-4 glow-border">
        <div className="flex items-start gap-3 mb-3">
          <Layers className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h1 className="text-sm font-mono font-bold text-foreground">Custom Intel Lab</h1>
            <p className="text-[10px] font-mono text-muted-foreground mt-1 leading-relaxed max-w-3xl">
              Pick money-flow subcategories from any industries, assign <span className="text-primary">primary</span> (your position) vs{" "}
              <span className="text-accent">secondary</span> (context to scan for what matters to you). Add a free-text role if you don’t fit the
              list. Uses your <strong>top-bar region</strong> for geo. Generates a deep brief; then ask follow-ups.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Add subcategory to pool</p>
            <div className="flex flex-wrap gap-2 items-end">
              <select
                className="text-[10px] font-mono bg-background border border-border rounded px-2 py-1.5 max-w-[200px]"
                value={industrySlug}
                onChange={(e) => setIndustrySlug(e.target.value)}
              >
                {industries.map((ind) => (
                  <option key={ind.slug} value={ind.slug}>
                    {ind.icon} {ind.name}
                  </option>
                ))}
              </select>
              <select
                className="text-[10px] font-mono bg-background border border-border rounded px-2 py-1.5 flex-1 min-w-[160px]"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) addSpecificToPool(v);
                  e.target.selectedIndex = 0;
                }}
              >
                <option value="">Choose money flow…</option>
                {subOptions.map((o) => (
                  <option key={o.subFlow.id} value={buildSubFlowKey(o.industrySlug, o.subFlow.id)}>
                    {o.subFlow.shortName} — {o.subFlow.name.slice(0, 42)}…
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm" className="text-[10px] h-7 font-mono" onClick={addToPool} type="button">
              Add first flow in industry
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Your text context (optional)</p>
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder='e.g. "Solo developer: React, edge functions, payments integrations" or "Civil works subcontractor focusing on roads"'
              className="min-h-[72px] text-[10px] font-mono bg-background/80"
            />
            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="freeTextMode"
                  checked={freeTextMode === "primary"}
                  onChange={() => setFreeTextMode("primary")}
                />
                text is primary
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="freeTextMode"
                  checked={freeTextMode === "generic"}
                  onChange={() => setFreeTextMode("generic")}
                />
                text is generic context
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <Button variant="secondary" size="sm" className="text-[10px] h-7 font-mono gap-1" type="button" onClick={shuffleRoles}>
            <Shuffle className="w-3 h-3" />
            Randomize primary / secondary
          </Button>
          <span className="text-[9px] text-muted-foreground font-mono">from pool + assigned</span>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <div className="rounded border border-border/40 p-2 bg-background/40">
            <p className="text-[9px] font-mono font-bold text-muted-foreground mb-2">Pool</p>
            <div className="flex flex-wrap gap-1.5 min-h-[40px]">
              {[...pool].map((k) => chip(k))}
              {pool.size === 0 && <span className="text-[9px] text-muted-foreground">Empty</span>}
            </div>
          </div>
          <div className="rounded border border-primary/30 p-2 bg-primary/5">
            <p className="text-[9px] font-mono font-bold text-primary mb-2 flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> Primary
            </p>
            <div className="flex flex-wrap gap-1.5 min-h-[40px]">
              {[...primary].map((k) => chip(k))}
              {primary.size === 0 && <span className="text-[9px] text-muted-foreground">None</span>}
            </div>
          </div>
          <div className="rounded border border-accent/30 p-2 bg-accent/5">
            <p className="text-[9px] font-mono font-bold text-accent mb-2">Secondary</p>
            <div className="flex flex-wrap gap-1.5 min-h-[40px]">
              {[...secondary].map((k) => chip(k))}
              {secondary.size === 0 && <span className="text-[9px] text-muted-foreground">None</span>}
            </div>
          </div>
        </div>

        {error && <p className="text-[10px] font-mono text-destructive mt-2">{error}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="font-mono text-[11px] gap-2" onClick={runIntel} disabled={loading} type="button">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Run custom deep intel
          </Button>
          {report && (
            <Button variant="outline" className="font-mono text-[11px] gap-1" type="button" onClick={runIntel} disabled={loading}>
              <RefreshCw className="w-3 h-3" />
              Refresh brief
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="glass-panel p-8 flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-mono text-muted-foreground">Synthesizing cross-domain intel for your primary/secondary lens…</p>
        </div>
      )}

      {!loading && segments.length > 0 && (
        <div className="glass-panel p-4 space-y-4">
          <h2 className="text-xs font-mono font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> BRIEF
          </h2>
          <BlockRenderer segments={segments} />
        </div>
      )}

      {report && !loading && (
        <div className="glass-panel p-4 space-y-3 border border-border/50">
          <h3 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Follow-up</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto text-[10px] font-mono">
            {chatMessages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded px-2 py-1.5 whitespace-pre-wrap",
                  m.role === "user" ? "bg-muted/40 text-foreground ml-4" : "bg-primary/5 text-foreground mr-4 border border-primary/15",
                )}
              >
                <span className="text-muted-foreground">{m.role === "user" ? "You: " : "Maverick: "}</span>
                {m.content}
              </div>
            ))}
            {chatStreaming && (
              <div className="rounded px-2 py-1.5 whitespace-pre-wrap bg-primary/5 text-foreground mr-4 border border-primary/15 text-[10px] font-mono">
                <span className="text-muted-foreground">Maverick: </span>
                {chatStreaming}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question, request a deeper cut on one linkage, or challenge an assumption…"
              className="min-h-[56px] text-[10px] font-mono flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendFollowUp();
                }
              }}
            />
            <Button type="button" className="shrink-0 font-mono text-[10px] h-auto" onClick={sendFollowUp} disabled={!chatInput.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
