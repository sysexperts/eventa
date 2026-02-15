import { useEffect, useState } from "react";
import { api, type AdminUser, type GlobalSource, type EventCategory } from "../lib/api";
import { useAuth } from "../state/auth";
import { categoryLabel } from "../lib/format";
import { Button, Input, Label } from "../ui/components";

const ALL_CATEGORIES: EventCategory[] = [
  "KONZERT", "FESTIVAL", "MUSICAL", "OPER", "KABARETT", "OPEN_MIC", "DJ_EVENT",
  "THEATER", "COMEDY", "TANZ", "ZAUBERSHOW",
  "AUSSTELLUNG", "LESUNG", "FILM", "FOTOGRAFIE", "MUSEUM",
  "FLOHMARKT", "WOCHENMARKT", "WEIHNACHTSMARKT", "MESSE", "FOOD_FESTIVAL",
  "SPORT", "LAUF", "TURNIER", "YOGA", "WANDERUNG",
  "KINDERTHEATER", "FAMILIENTAG", "KINDER_WORKSHOP",
  "WEINPROBE", "CRAFT_BEER", "KOCHKURS", "FOOD_TRUCK", "KULINARISCHE_TOUR",
  "WORKSHOP", "SEMINAR", "KONFERENZ", "NETWORKING", "VORTRAG",
  "CLUBNACHT", "KARAOKE", "PARTY",
  "KARNEVAL", "OKTOBERFEST", "SILVESTER", "STADTFEST", "STRASSENFEST",
  "SONSTIGES",
];

export function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"users" | "sources">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [newUrls, setNewUrls] = useState<Record<string, string>>({});
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  // Global sources state
  const [sources, setSources] = useState<GlobalSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [newSource, setNewSource] = useState({ url: "", label: "", defaultCategory: "", defaultCity: "" });
  const [scrapeResult, setScrapeResult] = useState<Record<string, string>>({});

  async function loadUsers() {
    try {
      const res = await api.admin.listUsers();
      setUsers(res.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSources() {
    setSourcesLoading(true);
    try {
      const res = await api.admin.listGlobalSources();
      setSources(res.sources);
    } catch { setSources([]); }
    finally { setSourcesLoading(false); }
  }

  useEffect(() => {
    loadUsers();
    loadSources();
  }, []);

  if (!user?.isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="text-4xl">🔒</div>
        <p className="mt-4 text-surface-400">Kein Zugriff. Nur Administratoren koennen diese Seite sehen.</p>
      </div>
    );
  }

  async function togglePartner(userId: string, current: boolean) {
    setBusy(userId);
    try {
      await api.admin.updateUser(userId, { isPartner: !current });
      await loadUsers();
    } catch {
      alert("Fehler beim Aendern des Partner-Status.");
    } finally {
      setBusy(null);
    }
  }

  async function addUrls(userId: string) {
    const raw = newUrls[userId] || "";
    const lines = raw
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    if (lines.length === 0) return;

    const urlObjects = lines.map((line: string) => {
      const parts = line.split("|").map((p: string) => p.trim());
      return { url: parts[0], label: parts[1] || undefined };
    });

    // Validate URLs
    const invalid = urlObjects.filter((u: { url: string }) => {
      try {
        new URL(u.url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalid.length > 0) {
      alert(`Ungueltige URLs:\n${invalid.map((u: { url: string }) => u.url).join("\n")}`);
      return;
    }

    setBusy(userId);
    try {
      const result = await api.admin.addUrls(userId, urlObjects);
      setNewUrls((prev) => ({ ...prev, [userId]: "" }));
      await loadUsers();
      alert(`${result.created} URL(s) hinzugefuegt${result.skipped > 0 ? `, ${result.skipped} bereits vorhanden` : ""}.`);
    } catch {
      alert("Fehler beim Hinzufuegen der URLs.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteUrl(urlId: string) {
    if (!confirm("URL wirklich entfernen?")) return;
    try {
      await api.admin.deleteUrl(urlId);
      await loadUsers();
    } catch {
      alert("Fehler beim Entfernen.");
    }
  }

  async function toggleUrlActive(urlId: string, current: boolean) {
    try {
      await api.admin.updateUrl(urlId, { isActive: !current });
      await loadUsers();
    } catch {
      alert("Fehler.");
    }
  }

  async function addSource() {
    if (!newSource.url.trim()) return;
    try { new URL(newSource.url); } catch { return alert("Ungueltige URL."); }
    setBusy("add-source");
    try {
      await api.admin.addGlobalSource({
        url: newSource.url,
        label: newSource.label || undefined,
        defaultCategory: newSource.defaultCategory || undefined,
        defaultCity: newSource.defaultCity || undefined,
      });
      setNewSource({ url: "", label: "", defaultCategory: "", defaultCity: "" });
      await loadSources();
    } catch (e: any) {
      alert(e?.message || "Fehler beim Hinzufuegen.");
    } finally { setBusy(null); }
  }

  async function deleteSource(id: string) {
    if (!confirm("Quelle wirklich entfernen?")) return;
    try { await api.admin.deleteGlobalSource(id); await loadSources(); }
    catch { alert("Fehler."); }
  }

  async function toggleSource(id: string, current: boolean) {
    try { await api.admin.updateGlobalSource(id, { isActive: !current }); await loadSources(); }
    catch { alert("Fehler."); }
  }

  async function scrapeSource(id: string) {
    setBusy(id);
    setScrapeResult((p) => ({ ...p, [id]: "Scraping..." }));
    try {
      const res = await api.admin.scrapeGlobalSource(id);
      setScrapeResult((p) => ({ ...p, [id]: res.error ? `Fehler: ${res.error}` : `${res.newEvents} neue, ${res.skipped} uebersprungen` }));
      await loadSources();
    } catch (e: any) {
      setScrapeResult((p) => ({ ...p, [id]: `Fehler: ${e?.message || "Unbekannt"}` }));
    } finally { setBusy(null); }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">Admin</span>
        <h1 className="text-2xl font-bold tracking-tight text-white">Administration</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1">
        <button
          onClick={() => setTab("users")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "users" ? "bg-white/[0.08] text-white" : "text-surface-400 hover:text-white"
          }`}
        >
          Benutzer ({users.length})
        </button>
        <button
          onClick={() => setTab("sources")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "sources" ? "bg-white/[0.08] text-white" : "text-surface-400 hover:text-white"
          }`}
        >
          Globale Quellen ({sources.length})
        </button>
      </div>

      {/* ─── Sources Tab ─── */}
      {tab === "sources" && (
        <div className="space-y-4">
          <p className="text-sm text-surface-400">
            Globale Quellen werden automatisch taeglich gescrapt. Events landen als Vorschlaege im Dashboard und werden automatisch kategorisiert.
          </p>

          {/* Add new source */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
            <div className="text-sm font-medium text-white">Neue Quelle hinzufuegen</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>URL *</Label>
                <Input
                  value={newSource.url}
                  onChange={(e: any) => setNewSource((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://stadt.de/veranstaltungen"
                />
              </div>
              <div>
                <Label>Bezeichnung</Label>
                <Input
                  value={newSource.label}
                  onChange={(e: any) => setNewSource((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Stadtportal Musterstadt"
                />
              </div>
              <div>
                <Label>Standard-Kategorie</Label>
                <select
                  value={newSource.defaultCategory}
                  onChange={(e: any) => setNewSource((p) => ({ ...p, defaultCategory: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                >
                  <option value="">Auto-Erkennung</option>
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <Label>Standard-Stadt</Label>
                <Input
                  value={newSource.defaultCity}
                  onChange={(e: any) => setNewSource((p) => ({ ...p, defaultCity: e.target.value }))}
                  placeholder="z.B. Stuttgart"
                />
              </div>
            </div>
            <Button onClick={addSource} disabled={busy === "add-source" || !newSource.url.trim()}>
              {busy === "add-source" ? "Speichere..." : "Quelle hinzufuegen"}
            </Button>
          </div>

          {/* Sources list */}
          {sourcesLoading ? (
            <div className="py-8 text-center text-sm text-surface-500">Lade Quellen...</div>
          ) : sources.length === 0 ? (
            <div className="py-8 text-center text-sm text-surface-500">Noch keine globalen Quellen hinterlegt.</div>
          ) : (
            <div className="space-y-2">
              {sources.map((s) => (
                <div key={s.id} className={`rounded-2xl border p-4 ${
                  s.isActive ? "border-white/[0.06] bg-white/[0.03]" : "border-white/[0.04] bg-white/[0.01] opacity-60"
                }`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${s.isActive ? (s.errorCount > 0 ? "bg-amber-400" : "bg-neon-green") : "bg-surface-600"}`} />
                        <span className="font-medium text-white text-sm">{s.label || new URL(s.url).hostname}</span>
                        {s.defaultCategory && (
                          <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-accent-400">
                            {categoryLabel(s.defaultCategory as EventCategory)}
                          </span>
                        )}
                        {s.defaultCity && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-blue-400">
                            {s.defaultCity}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-surface-500 truncate">{s.url}</div>
                      <div className="mt-1 flex gap-3 text-[11px] text-surface-600">
                        {s.lastScrapedAt && (
                          <span>Letzter Scan: {new Date(s.lastScrapedAt).toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                        {s.lastEventCount > 0 && <span className="text-neon-green">{s.lastEventCount} neue</span>}
                        {s.errorCount > 0 && <span className="text-amber-400">Fehler: {s.lastError}</span>}
                      </div>
                      {scrapeResult[s.id] && (
                        <div className={`mt-1 text-xs ${scrapeResult[s.id].startsWith("Fehler") ? "text-red-400" : "text-neon-green"}`}>
                          {scrapeResult[s.id]}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => scrapeSource(s.id)}
                        disabled={busy === s.id}
                        className="rounded-lg bg-accent-500/20 px-3 py-1.5 text-xs font-medium text-accent-400 hover:bg-accent-500/30 disabled:opacity-30"
                      >
                        {busy === s.id ? "..." : "Jetzt scannen"}
                      </button>
                      <button
                        onClick={() => toggleSource(s.id, s.isActive)}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-surface-400 hover:bg-white/10"
                      >
                        {s.isActive ? "Pause" : "Aktiv"}
                      </button>
                      <button
                        onClick={() => deleteSource(s.id)}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Users Tab ─── */}
      {tab === "users" && (<>
      <p className="text-sm text-surface-400">
        Alle registrierten Benutzer. Du kannst Partner-Rechte vergeben und ueberwachte URLs fuer Kunden hinterlegen.
      </p>

      {loading ? (
        <div className="py-12 text-center text-sm text-surface-500">Lade Benutzer...</div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-sm text-surface-500">Keine Benutzer gefunden.</div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const isExpanded = expandedUser === u.id;
            return (
              <div key={u.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                {/* User Header */}
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                  className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white">{u.name}</span>
                        {u.isAdmin && (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-red-400">Admin</span>
                        )}
                        {u.isPartner && (
                          <span className="rounded-full bg-neon-green/20 px-2 py-0.5 text-[9px] font-bold uppercase text-neon-green">Partner</span>
                        )}
                        {!u.isPartner && !u.isAdmin && (
                          <span className="rounded-full bg-surface-700/50 px-2 py-0.5 text-[9px] font-bold uppercase text-surface-400">Standard</span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-surface-500">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-surface-500 shrink-0">
                      <span>{u._count.events} Events</span>
                      <span>{u._count.scrapedEvents} Scraped</span>
                      <span>{u.monitoredUrls.length} URLs</span>
                      {u.isPartner && (
                        <span className="text-amber-400">{u.promotionTokens} Tokens</span>
                      )}
                      <span className="text-accent-400">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] p-4 space-y-4">
                    {/* Partner Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">Partner-Status</div>
                        <div className="text-xs text-surface-500">Partner koennen die automatische Indexierung nutzen.</div>
                      </div>
                      <button
                        onClick={() => togglePartner(u.id, u.isPartner)}
                        disabled={busy === u.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          u.isPartner ? "bg-neon-green/60" : "bg-surface-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            u.isPartner ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Promotion Tokens */}
                    {u.isPartner && (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">Promotion Tokens</div>
                          <div className="text-xs text-surface-500">Tokens fuer bevorzugte Listung. 1 Token pro Monat automatisch.</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-amber-400">{u.promotionTokens}</span>
                          <input
                            type="number"
                            min="0"
                            value={tokenInputs[u.id] ?? String(u.promotionTokens)}
                            onChange={(e: any) => setTokenInputs((prev) => ({ ...prev, [u.id]: e.target.value }))}
                            className="w-16 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-center text-sm text-white focus:border-accent-500 focus:outline-none"
                          />
                          <button
                            onClick={async () => {
                              const val = parseInt(tokenInputs[u.id] ?? String(u.promotionTokens), 10);
                              if (isNaN(val) || val < 0) return;
                              setBusy(u.id);
                              try {
                                await api.admin.updateUser(u.id, { promotionTokens: val });
                                setTokenInputs((prev) => { const n = { ...prev }; delete n[u.id]; return n; });
                                await loadUsers();
                              } catch { alert("Fehler."); }
                              finally { setBusy(null); }
                            }}
                            disabled={busy === u.id || (tokenInputs[u.id] ?? String(u.promotionTokens)) === String(u.promotionTokens)}
                            className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/30 disabled:opacity-30"
                          >
                            Setzen
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Website */}
                    {u.website && (
                      <div className="text-xs text-surface-500">
                        Website: <a href={u.website} target="_blank" rel="noreferrer" className="text-accent-400 hover:text-accent-300">{u.website}</a>
                      </div>
                    )}

                    {/* Monitored URLs */}
                    <div>
                      <div className="text-sm font-medium text-white mb-2">Ueberwachte Seiten ({u.monitoredUrls.length})</div>

                      {u.monitoredUrls.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          {u.monitoredUrls.map((mu) => (
                            <div
                              key={mu.id}
                              className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${
                                mu.isActive
                                  ? "border-white/[0.08] bg-white/[0.02]"
                                  : "border-white/[0.04] bg-white/[0.01] opacity-50"
                              }`}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${mu.isActive ? (mu.errorCount > 0 ? "bg-amber-400" : "bg-neon-green") : "bg-surface-600"}`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-white truncate">{mu.label || mu.url}</div>
                                {mu.label && <div className="text-surface-600 truncate">{mu.url}</div>}
                                <div className="flex gap-2 text-surface-600 mt-0.5">
                                  {mu.lastScrapedAt && (
                                    <span>Letzter Scan: {new Date(mu.lastScrapedAt).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}</span>
                                  )}
                                  {mu.lastEventCount > 0 && <span className="text-neon-green">{mu.lastEventCount} neue</span>}
                                  {mu.errorCount > 0 && <span className="text-amber-400">Fehler: {mu.lastError}</span>}
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => toggleUrlActive(mu.id, mu.isActive)}
                                  className="rounded bg-white/5 px-2 py-1 text-[10px] text-surface-400 hover:bg-white/10"
                                >
                                  {mu.isActive ? "Pause" : "Aktiv"}
                                </button>
                                <button
                                  onClick={() => deleteUrl(mu.id)}
                                  className="rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/20"
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add URLs */}
                      <div className="space-y-2">
                        <Label>URLs hinzufuegen (eine pro Zeile, optional: URL|Bezeichnung)</Label>
                        <textarea
                          value={newUrls[u.id] || ""}
                          onChange={(e: any) => setNewUrls((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          placeholder={"https://venue.de/events\nhttps://venue.de/konzerte|Konzerte\nhttps://venue.de/theater|Theater"}
                          rows={3}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-surface-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 font-mono"
                        />
                        <Button
                          onClick={() => addUrls(u.id)}
                          disabled={busy === u.id || !(newUrls[u.id] || "").trim()}
                        >
                          {busy === u.id ? "Speichere..." : "URLs hinzufuegen"}
                        </Button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-[10px] text-surface-600">
                      Registriert: {new Date(u.createdAt).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>)}
    </div>
  );
}
