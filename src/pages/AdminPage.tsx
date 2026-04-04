import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { invokeAdminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RefreshCw, Shield, Trash2, Stethoscope, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMinimumSkeleton } from "@/hooks/useMinimumSkeleton";
import { AdminDashboardSkeleton } from "@/components/ui/PageSkeletons";

type DashboardOverview = {
  profileCount: number;
  activeSubscriptions: number;
  totalTokenUnitsLogged: number;
  note?: string;
};

type UserRow = {
  id: string;
  email: string | undefined;
  created_at: string;
  last_sign_in_at: string | null;
  profile: Record<string, unknown> | null;
  subscription: { status: string; amount?: number; current_period_end?: string | null } | null;
  tokens_total: number;
};

type PathStat = { path: string; views: number; unique_visitors: number };

type IntegrationRow = {
  id: string;
  key_code: string;
  display_name: string;
  description: string | null;
  source_file_hint: string | null;
  sort_order: number;
  health_status: string;
  last_health_message: string | null;
  last_checked_at: string | null;
  secret_masked: string;
  has_secret: boolean;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [paths, setPaths] = useState<PathStat[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationRow[]>([]);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<IntegrationRow> & { secret_value?: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const overviewRef = useRef<DashboardOverview | null>(null);
  overviewRef.current = overview;

  const loadAll = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent && overviewRef.current);
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [dash, u, pa, integ, hist] = await Promise.all([
        invokeAdminApi<DashboardOverview>({ action: "dashboard" }),
        invokeAdminApi<{ users: UserRow[] }>({ action: "users" }),
        invokeAdminApi<{ paths: PathStat[] }>({ action: "page_analytics" }),
        invokeAdminApi<{ integrations: IntegrationRow[] }>({ action: "api_integrations_list" }),
        invokeAdminApi<{ history: Record<string, unknown>[] }>({ action: "api_health_history" }),
      ]);
      setOverview(dash);
      setUsers(u.users || []);
      setPaths(pa.paths || []);
      setIntegrations(integ.integrations || []);
      setHistory(hist.history || []);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to load admin data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const openNew = () => {
    setEditing({
      key_code: "",
      display_name: "",
      description: "",
      source_file_hint: "",
      sort_order: 100,
      secret_value: "",
    });
    setEditOpen(true);
  };

  const openEdit = async (row: IntegrationRow) => {
    try {
      const r = await invokeAdminApi<{ integration: Record<string, unknown> }>({
        action: "api_integration_get",
        id: row.id,
      });
      setEditing({
        ...(r.integration as Record<string, unknown>),
        secret_value: String(r.integration.secret_value || ""),
      } as Partial<IntegrationRow> & { secret_value?: string });
      setEditOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    }
  };

  const saveIntegration = async () => {
    if (!editing?.key_code?.trim() || !editing?.display_name?.trim()) {
      toast.error("Key code and display name are required");
      return;
    }
    try {
      await invokeAdminApi({
        action: "api_integration_upsert",
        payload: {
          id: editing.id,
          key_code: editing.key_code.trim(),
          display_name: editing.display_name.trim(),
          description: editing.description || "",
          source_file_hint: editing.source_file_hint || "",
          sort_order: Number(editing.sort_order) || 0,
          secret_value: editing.secret_value || "",
        },
      });
      toast.success("Saved");
      setEditOpen(false);
      setEditing(null);
      await loadAll({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const runHealth = async (id: string) => {
    try {
      const r = await invokeAdminApi<{ ok: boolean; message: string }>({ action: "api_health_check", id });
      toast[r.ok ? "success" : "error"](r.message);
      await loadAll({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Health check failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await invokeAdminApi({ action: "api_integration_delete", id: deleteId });
      toast.success("Deleted");
      setDeleteId(null);
      await loadAll({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const bootstrapping = loading && !overview;
  const showBootSkeleton = useMinimumSkeleton(bootstrapping);

  if (showBootSkeleton) {
    return <AdminDashboardSkeleton />;
  }

  /** Viewport minus top bar (~60px), main padding, mobile bottom nav (~4.5rem). Keeps header/tabs fixed; tab body scrolls. */
  const adminChrome =
    "h-[calc(100dvh-7.85rem-env(safe-area-inset-bottom,0px))] max-h-[calc(100dvh-7.85rem-env(safe-area-inset-bottom,0px))] md:h-[calc(100dvh-5.35rem)] md:max-h-[calc(100dvh-5.35rem)]";

  return (
    <div
      className={cn(
        "mx-auto flex max-w-6xl min-h-0 flex-col overflow-hidden",
        adminChrome,
      )}
    >
      <div className="shrink-0 space-y-3 border-b border-border/40 bg-background pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-6 w-6 shrink-0" />
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Admin</h1>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Users, subscriptions, page traffic, API registry, and health checks. Edge Function <code className="text-xs">admin-api</code>{" "}
              enforces access; keep secrets out of client bundles — values here live in Supabase DB and are only loaded over this
              endpoint.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            disabled={refreshing}
            onClick={() => void loadAll({ silent: true })}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin text-primary")} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col gap-0 pt-3">
        <TabsList className="h-auto shrink-0 flex flex-wrap justify-start gap-1 bg-muted/60 p-1.5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="traffic">Page traffic</TabsTrigger>
          <TabsTrigger value="apis">APIs & health</TabsTrigger>
          <TabsTrigger value="audit">Health log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Profiles</p>
              <p className="mt-2 font-display text-3xl font-bold tabular-nums">{overview?.profileCount ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Active subscriptions</p>
              <p className="mt-2 font-display text-3xl font-bold tabular-nums text-primary">{overview?.activeSubscriptions ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tokens logged (all users)</p>
              <p className="mt-2 font-display text-3xl font-bold tabular-nums">{overview?.totalTokenUnitsLogged ?? 0}</p>
            </div>
          </div>
          {overview?.note && <p className="text-sm text-muted-foreground leading-relaxed">{overview.note}</p>}
        </TabsContent>

        <TabsContent value="users" className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4 pr-1 outline-none">
          <div className="rounded-2xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Subscription</th>
                  <th className="p-3 font-semibold">Tokens (logged)</th>
                  <th className="p-3 font-semibold">Last sign-in</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border/40">
                    <td className="p-3 font-medium">{u.email}</td>
                    <td className="p-3 text-muted-foreground">
                      {u.subscription ? (
                        <span className="text-foreground">{u.subscription.status}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 tabular-nums">{u.tokens_total}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4 pr-1 outline-none">
          <p className="mb-3 text-sm text-muted-foreground">
            Counts from authenticated page views only (see <code className="text-xs">RoutePageViewTracker</code> in layout).
          </p>
          <div className="rounded-2xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3 font-semibold">Path</th>
                  <th className="p-3 font-semibold">Views</th>
                  <th className="p-3 font-semibold">Unique visitors</th>
                </tr>
              </thead>
              <tbody>
                {paths.map((p) => (
                  <tr key={p.path} className="border-t border-border/40">
                    <td className="p-3 font-mono text-xs break-all">{p.path}</td>
                    <td className="p-3 tabular-nums">{p.views}</td>
                    <td className="p-3 tabular-nums">{p.unique_visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="apis" className="mt-0 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pt-4 pr-1 outline-none">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="gap-2" onClick={openNew}>
              <Plus className="h-4 w-4" />
              Add integration
            </Button>
          </div>
          <div className="space-y-3">
            {integrations.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-foreground">{row.display_name}</p>
                  <p className="text-xs font-mono text-primary">{row.key_code}</p>
                  {row.description && <p className="text-sm text-muted-foreground leading-relaxed">{row.description}</p>}
                  {row.source_file_hint && (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/80">Code / file hint:</span> {row.source_file_hint}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Stored value:{" "}
                    <span className="font-mono text-foreground">{row.has_secret ? row.secret_masked || "••••" : "(empty)"}</span>
                  </p>
                  <p className="text-xs">
                    Status:{" "}
                    <span
                      className={cn(
                        "font-semibold",
                        row.health_status === "ok" && "text-emerald-600 dark:text-emerald-400",
                        row.health_status === "error" && "text-destructive",
                      )}
                    >
                      {row.health_status}
                    </span>
                    {row.last_health_message && <span className="text-muted-foreground"> — {row.last_health_message}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" className="gap-1" onClick={() => void openEdit(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => void runHealth(row.id)}>
                    <Stethoscope className="h-3.5 w-3.5" />
                    Test
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="text-destructive gap-1" onClick={() => setDeleteId(row.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Runtime Edge Functions still use Supabase project secrets unless you add code to read from <code className="text-xs">api_integrations</code>.
            Use this registry to track names, test connectivity, and mirror values after rotation.
          </p>
        </TabsContent>

        <TabsContent value="audit" className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4 pr-1 outline-none">
          <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
            Entries appear after you click <strong className="text-foreground">Test</strong> on an integration under{" "}
            <strong className="text-foreground">APIs &amp; health</strong>. Until then this list is empty. If it stays empty after
            testing, confirm the migration <code className="text-xs">20260403120000_admin_dashboard.sql</code> ran and{" "}
            <code className="text-xs">admin-api</code> is deployed.
          </p>
          <div className="rounded-2xl border border-border/60 p-3">
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No health checks recorded yet.</p>
            ) : (
              <ul className="space-y-2 text-xs font-mono">
                {history.map((h) => {
                  const rel = h.api_integrations as { key_code?: string; display_name?: string } | null | undefined;
                  const label = rel?.display_name || rel?.key_code || String(h.integration_id || "").slice(0, 8);
                  return (
                    <li key={String(h.id)} className="border-b border-border/30 pb-2 last:border-0">
                      <span className="text-muted-foreground">{String(h.checked_at)}</span>{" "}
                      <span className="font-semibold text-foreground">[{label}]</span>{" "}
                      <span className={cn(h.status === "ok" ? "text-emerald-600" : "text-destructive")}>{String(h.status)}</span>{" "}
                      {String(h.message || "")}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <p className="shrink-0 pt-4 text-center text-sm">
        <Link to="/dashboard" className="text-primary font-medium hover:underline">
          ← Back to dashboard
        </Link>
      </p>

      {editOpen && editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h2 className="font-display text-lg font-bold">{editing.id ? "Edit integration" : "New integration"}</h2>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Key code (env name)</label>
              <Input
                value={editing.key_code || ""}
                onChange={(e) => setEditing({ ...editing, key_code: e.target.value })}
                placeholder="LOVABLE_API_KEY"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Display name</label>
              <Input
                value={editing.display_name || ""}
                onChange={(e) => setEditing({ ...editing, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Code / file hint</label>
              <Input
                value={editing.source_file_hint || ""}
                onChange={(e) => setEditing({ ...editing, source_file_hint: e.target.value })}
                placeholder="supabase/functions/foo/index.ts"
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Sort order</label>
                <Input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Secret / value</label>
              <Textarea
                value={editing.secret_value || ""}
                onChange={(e) => setEditing({ ...editing, secret_value: e.target.value })}
                rows={4}
                placeholder="Paste secret; stored in DB — restrict RLS to service role"
                className="font-mono text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void saveIntegration()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete integration?</AlertDialogTitle>
            <AlertDialogDescription>This removes the registry row. Supabase secrets are unchanged.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
