import { useEffect, useState } from "react";
import { api, type AdminUser, type GlobalSource, type EventCategory, type Community, type CommunityMember } from "../lib/api";
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
  const [tab, setTab] = useState<"users" | "sources" | "communities">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [newUrls, setNewUrls] = useState<Record<string, string>>({});
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  // User search state
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<(AdminUser & { _count: { events: number; communityMembers: number } })[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchPages, setSearchPages] = useState(1);
  const [searching, setSearching] = useState(false);

  // Global sources state
  const [sources, setSources] = useState<GlobalSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [newSource, setNewSource] = useState({ url: "", label: "", defaultCategory: "", defaultCity: "" });
  const [scrapeResult, setScrapeResult] = useState<Record<string, string>>({});

  // Communities state
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [expandedCommunity, setExpandedCommunity] = useState<string | null>(null);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [communityMembersLoading, setCommunityMembersLoading] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    slug: "", name: "", shortDescription: "", description: "",
    country: "", language: "", city: "", region: "", timezone: "",
    contactEmail: "", website: "", phone: "",
    instagram: "", facebook: "", twitter: "", linkedin: "", youtube: "", discord: "", telegram: "", tiktok: "",
    category: "", tags: "" as string, visibility: "PUBLIC", rules: "", welcomeMessage: "",
    maxMembers: "" as string, color: "", imageUrl: "", bannerUrl: "",
  });
  const [roleAssign, setRoleAssign] = useState({ userId: "", role: "MEMBER" });
  const [memberSearch, setMemberSearch] = useState("");

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

  async function loadCommunities() {
    setCommunitiesLoading(true);
    try {
      const res = await api.admin.listCommunities();
      setCommunities(res.communities);
    } catch { setCommunities([]); }
    finally { setCommunitiesLoading(false); }
  }

  async function loadCommunityMembers(communityId: string, q = "") {
    setCommunityMembersLoading(true);
    try {
      const res = await api.admin.listCommunityMembers(communityId, q);
      setCommunityMembers(res.members);
    } catch { setCommunityMembers([]); }
    finally { setCommunityMembersLoading(false); }
  }

  async function searchUsers(q: string, page = 1) {
    setSearching(true);
    try {
      const res = await api.admin.searchUsers(q, page);
      setSearchResults(res.users);
      setSearchTotal(res.total);
      setSearchPage(res.page);
      setSearchPages(res.pages);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }

  useEffect(() => {
    loadUsers();
    loadSources();
    loadCommunities();
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
          onClick={() => setTab("communities")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "communities" ? "bg-white/[0.08] text-white" : "text-surface-400 hover:text-white"
          }`}
        >
          Communities ({communities.length})
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

      {/* ─── Communities Tab ─── */}
      {tab === "communities" && (
        <div className="space-y-4">
          <p className="text-sm text-surface-400">
            Communities verwalten. Du kannst neue Communities erstellen, Mitglieder verwalten und Rollen zuweisen.
          </p>

          {/* Create new community */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-5">
            <div className="text-base font-semibold text-white">Neue Community erstellen</div>

            {/* Section: Grunddaten */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent-400">Grunddaten</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Slug *</Label>
                  <Input value={newCommunity.slug} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, slug: e.target.value }))} placeholder="meine-community" />
                  <p className="mt-0.5 text-[10px] text-surface-600">URL-Pfad: /community/{newCommunity.slug || "..."}</p>
                </div>
                <div>
                  <Label>Name *</Label>
                  <Input value={newCommunity.name} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, name: e.target.value }))} placeholder="Meine Community" />
                </div>
                <div>
                  <Label>Kurzbeschreibung</Label>
                  <Input value={newCommunity.shortDescription} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, shortDescription: e.target.value }))} placeholder="Ein Satz ueber die Community (max 300 Zeichen)" />
                </div>
                <div>
                  <Label>Kategorie</Label>
                  <select value={newCommunity.category} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none">
                    <option value="">Keine Kategorie</option>
                    <option value="MUSIK">Musik</option>
                    <option value="KUNST">Kunst & Kultur</option>
                    <option value="SPORT">Sport & Fitness</option>
                    <option value="TECH">Technologie</option>
                    <option value="FOOD">Food & Drinks</option>
                    <option value="BILDUNG">Bildung & Workshops</option>
                    <option value="BUSINESS">Business & Networking</option>
                    <option value="SOCIAL">Soziales & Ehrenamt</option>
                    <option value="NACHTLEBEN">Nachtleben & Party</option>
                    <option value="OUTDOOR">Outdoor & Natur</option>
                    <option value="FAMILIE">Familie & Kinder</option>
                    <option value="SONSTIGES">Sonstiges</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Beschreibung</Label>
                  <textarea value={newCommunity.description} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, description: e.target.value }))} placeholder="Ausfuehrliche Beschreibung der Community, Ziele, Aktivitaeten..." rows={4} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-surface-600 focus:border-accent-500 focus:outline-none resize-none" />
                </div>
                <div>
                  <Label>Tags (kommagetrennt)</Label>
                  <Input value={newCommunity.tags} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, tags: e.target.value }))} placeholder="z.B. musik, konzerte, jazz" />
                </div>
                <div>
                  <Label>Akzentfarbe</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={newCommunity.color || "#6366f1"} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, color: e.target.value }))} className="h-9 w-12 rounded border border-white/10 bg-transparent cursor-pointer" />
                    <Input value={newCommunity.color} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, color: e.target.value }))} placeholder="#6366f1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Bilder */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent-400">Bilder</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Logo-URL</Label>
                  <Input value={newCommunity.imageUrl} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://example.com/logo.png" />
                </div>
                <div>
                  <Label>Banner-URL</Label>
                  <Input value={newCommunity.bannerUrl} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, bannerUrl: e.target.value }))} placeholder="https://example.com/banner.jpg" />
                </div>
              </div>
            </div>

            {/* Section: Standort & Sprache */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent-400">Standort & Sprache</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>Stadt</Label>
                  <Input value={newCommunity.city} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, city: e.target.value }))} placeholder="z.B. Stuttgart" />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input value={newCommunity.region} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, region: e.target.value }))} placeholder="z.B. Baden-Wuerttemberg" />
                </div>
                <div>
                  <Label>Land (ISO)</Label>
                  <Input value={newCommunity.country} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, country: e.target.value }))} placeholder="DE" />
                </div>
                <div>
                  <Label>Sprache</Label>
                  <Input value={newCommunity.language} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, language: e.target.value }))} placeholder="de" />
                </div>
                <div>
                  <Label>Zeitzone</Label>
                  <Input value={newCommunity.timezone} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, timezone: e.target.value }))} placeholder="Europe/Berlin" />
                </div>
              </div>
            </div>

            {/* Section: Kontakt */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent-400">Kontakt</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>E-Mail</Label>
                  <Input value={newCommunity.contactEmail} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, contactEmail: e.target.value }))} placeholder="kontakt@community.de" />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={newCommunity.website} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, website: e.target.value }))} placeholder="https://community.de" />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input value={newCommunity.phone} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+49 711 1234567" />
                </div>
              </div>
            </div>

            {/* Section: Social Media */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent-400">Social Media</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div><Label>Instagram</Label><Input value={newCommunity.instagram} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, instagram: e.target.value }))} placeholder="@username oder URL" /></div>
                <div><Label>Facebook</Label><Input value={newCommunity.facebook} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, facebook: e.target.value }))} placeholder="Seiten-URL" /></div>
                <div><Label>Twitter / X</Label><Input value={newCommunity.twitter} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, twitter: e.target.value }))} placeholder="@handle oder URL" /></div>
                <div><Label>LinkedIn</Label><Input value={newCommunity.linkedin} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, linkedin: e.target.value }))} placeholder="Profil-URL" /></div>
                <div><Label>YouTube</Label><Input value={newCommunity.youtube} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, youtube: e.target.value }))} placeholder="Kanal-URL" /></div>
                <div><Label>Discord</Label><Input value={newCommunity.discord} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, discord: e.target.value }))} placeholder="Einladungslink" /></div>
                <div><Label>Telegram</Label><Input value={newCommunity.telegram} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, telegram: e.target.value }))} placeholder="Gruppen-Link" /></div>
                <div><Label>TikTok</Label><Input value={newCommunity.tiktok} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, tiktok: e.target.value }))} placeholder="@username oder URL" /></div>
              </div>
            </div>

            {/* Section: Einstellungen */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent-400">Einstellungen</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Sichtbarkeit</Label>
                  <select value={newCommunity.visibility} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, visibility: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none">
                    <option value="PUBLIC">Oeffentlich – Jeder kann beitreten</option>
                    <option value="PRIVATE">Privat – Nur mit Einladung</option>
                    <option value="HIDDEN">Versteckt – Nicht in Suche sichtbar</option>
                  </select>
                </div>
                <div>
                  <Label>Max. Mitglieder (leer = unbegrenzt)</Label>
                  <Input type="number" value={newCommunity.maxMembers} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, maxMembers: e.target.value }))} placeholder="z.B. 500" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Community-Regeln</Label>
                  <textarea value={newCommunity.rules} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, rules: e.target.value }))} placeholder="1. Respektvoller Umgang&#10;2. Kein Spam&#10;3. ..." rows={4} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-surface-600 focus:border-accent-500 focus:outline-none resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Willkommensnachricht</Label>
                  <textarea value={newCommunity.welcomeMessage} onChange={(e: any) => setNewCommunity((p: any) => ({ ...p, welcomeMessage: e.target.value }))} placeholder="Willkommen in unserer Community! Hier findest du..." rows={3} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-surface-600 focus:border-accent-500 focus:outline-none resize-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
              <Button
                onClick={async () => {
                  if (!newCommunity.slug.trim() || !newCommunity.name.trim()) return;
                  setBusy("add-community");
                  try {
                    const payload: any = {
                      slug: newCommunity.slug.trim(),
                      name: newCommunity.name.trim(),
                    };
                    const optStr = ["shortDescription","description","imageUrl","bannerUrl","country","language","city","region","timezone","contactEmail","website","phone","instagram","facebook","twitter","linkedin","youtube","discord","telegram","tiktok","category","rules","welcomeMessage","color"] as const;
                    for (const k of optStr) { if (newCommunity[k]?.trim()) payload[k] = newCommunity[k].trim(); }
                    if (newCommunity.visibility !== "PUBLIC") payload.visibility = newCommunity.visibility;
                    if (newCommunity.tags.trim()) payload.tags = newCommunity.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
                    if (newCommunity.maxMembers && parseInt(newCommunity.maxMembers) > 0) payload.maxMembers = parseInt(newCommunity.maxMembers);
                    await api.admin.createCommunity(payload);
                    setNewCommunity({
                      slug: "", name: "", shortDescription: "", description: "",
                      country: "", language: "", city: "", region: "", timezone: "",
                      contactEmail: "", website: "", phone: "",
                      instagram: "", facebook: "", twitter: "", linkedin: "", youtube: "", discord: "", telegram: "", tiktok: "",
                      category: "", tags: "", visibility: "PUBLIC", rules: "", welcomeMessage: "",
                      maxMembers: "", color: "", imageUrl: "", bannerUrl: "",
                    });
                    await loadCommunities();
                  } catch (e: any) { alert(e?.message || "Fehler beim Erstellen."); }
                  finally { setBusy(null); }
                }}
                disabled={busy === "add-community" || !newCommunity.slug.trim() || !newCommunity.name.trim()}
              >
                {busy === "add-community" ? "Erstelle..." : "Community erstellen"}
              </Button>
              <span className="text-xs text-surface-500">* Pflichtfelder: Slug und Name</span>
            </div>
          </div>

          {/* Communities list */}
          {communitiesLoading ? (
            <div className="py-8 text-center text-sm text-surface-500">Lade Communities...</div>
          ) : communities.length === 0 ? (
            <div className="py-8 text-center text-sm text-surface-500">Noch keine Communities vorhanden.</div>
          ) : (
            <div className="space-y-2">
              {communities.map((c) => {
                const isExp = expandedCommunity === c.id;
                return (
                  <div key={c.id} className={`rounded-2xl border overflow-hidden ${
                    c.isActive !== false ? "border-white/[0.06] bg-white/[0.03]" : "border-white/[0.04] bg-white/[0.01] opacity-60"
                  }`}>
                    <button
                      onClick={() => {
                        if (isExp) { setExpandedCommunity(null); }
                        else { setExpandedCommunity(c.id); loadCommunityMembers(c.id); }
                      }}
                      className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{c.name}</span>
                            <span className="text-xs text-surface-500">/{c.slug}</span>
                            {c.country && (
                              <img src={`https://hatscripts.github.io/circle-flags/flags/${c.country.toLowerCase()}.svg`} alt="" className="h-4 w-4" />
                            )}
                          </div>
                          {c.description && <div className="mt-0.5 text-xs text-surface-500 line-clamp-1">{c.description}</div>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-surface-500">
                          <span>{c._count?.members ?? 0} Mitglieder</span>
                          <span>{c._count?.events ?? 0} Events</span>
                          <span className="text-accent-400">{isExp ? "▲" : "▼"}</span>
                        </div>
                      </div>
                    </button>

                    {isExp && (
                      <div className="border-t border-white/[0.06] p-4 space-y-4">
                        {/* Toggle active */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-white">Status</div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await api.admin.updateCommunity(c.id, { isActive: c.isActive === false });
                                  await loadCommunities();
                                } catch { alert("Fehler."); }
                              }}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                                c.isActive !== false
                                  ? "bg-neon-green/20 text-neon-green"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {c.isActive !== false ? "Aktiv" : "Deaktiviert"}
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Community "${c.name}" wirklich loeschen?`)) return;
                                try { await api.admin.deleteCommunity(c.id); await loadCommunities(); }
                                catch { alert("Fehler."); }
                              }}
                              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
                            >
                              Loeschen
                            </button>
                          </div>
                        </div>

                        {/* Assign role */}
                        <div>
                          <div className="text-sm font-medium text-white mb-2">Rolle zuweisen</div>
                          <div className="flex gap-2">
                            <Input
                              value={roleAssign.userId}
                              onChange={(e: any) => setRoleAssign((p) => ({ ...p, userId: e.target.value }))}
                              placeholder="User-ID"
                            />
                            <select
                              value={roleAssign.role}
                              onChange={(e: any) => setRoleAssign((p) => ({ ...p, role: e.target.value }))}
                              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none"
                            >
                              <option value="MEMBER">Member</option>
                              <option value="MODERATOR">Moderator</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <Button
                              onClick={async () => {
                                if (!roleAssign.userId.trim()) return;
                                try {
                                  await api.admin.assignCommunityRole(c.id, roleAssign.userId.trim(), roleAssign.role);
                                  setRoleAssign({ userId: "", role: "MEMBER" });
                                  await loadCommunityMembers(c.id);
                                } catch (e: any) { alert(e?.message || "Fehler."); }
                              }}
                              disabled={!roleAssign.userId.trim()}
                            >
                              Zuweisen
                            </Button>
                          </div>
                        </div>

                        {/* User search for role assignment */}
                        <div>
                          <div className="text-sm font-medium text-white mb-2">User suchen</div>
                          <div className="flex gap-2">
                            <Input
                              value={userSearch}
                              onChange={(e: any) => setUserSearch(e.target.value)}
                              placeholder="Name oder E-Mail..."
                              onKeyDown={(e: any) => { if (e.key === "Enter") searchUsers(userSearch); }}
                            />
                            <Button onClick={() => searchUsers(userSearch)} disabled={searching}>
                              {searching ? "..." : "Suchen"}
                            </Button>
                          </div>
                          {searchResults.length > 0 && (
                            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                              {searchResults.map((u) => (
                                <div key={u.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs">
                                  <div>
                                    <span className="font-medium text-white">{u.name}</span>
                                    <span className="ml-2 text-surface-500">{u.email}</span>
                                    <span className="ml-2 text-surface-600">ID: {u.id.slice(0, 8)}...</span>
                                  </div>
                                  <button
                                    onClick={() => setRoleAssign((p) => ({ ...p, userId: u.id }))}
                                    className="rounded bg-accent-500/20 px-2 py-1 text-accent-400 hover:bg-accent-500/30"
                                  >
                                    Auswaehlen
                                  </button>
                                </div>
                              ))}
                              {searchPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-2">
                                  <button disabled={searchPage <= 1} onClick={() => searchUsers(userSearch, searchPage - 1)} className="text-xs text-surface-400 hover:text-white disabled:opacity-30">← Zurueck</button>
                                  <span className="text-xs text-surface-500">{searchPage}/{searchPages} ({searchTotal} Treffer)</span>
                                  <button disabled={searchPage >= searchPages} onClick={() => searchUsers(userSearch, searchPage + 1)} className="text-xs text-surface-400 hover:text-white disabled:opacity-30">Weiter →</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Members list */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-white">Mitglieder</div>
                            <Input
                              value={memberSearch}
                              onChange={(e: any) => { setMemberSearch(e.target.value); loadCommunityMembers(c.id, e.target.value); }}
                              placeholder="Mitglied suchen..."
                              className="!w-48"
                            />
                          </div>
                          {communityMembersLoading ? (
                            <div className="text-xs text-surface-500">Lade...</div>
                          ) : communityMembers.length === 0 ? (
                            <div className="text-xs text-surface-500">Keine Mitglieder.</div>
                          ) : (
                            <div className="space-y-1">
                              {communityMembers.map((m) => (
                                <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">{m.user.name}</span>
                                    {m.user.email && <span className="text-surface-500">{m.user.email}</span>}
                                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                      m.role === "ADMIN" ? "bg-red-500/20 text-red-400" :
                                      m.role === "MODERATOR" ? "bg-amber-500/20 text-amber-400" :
                                      "bg-surface-700/50 text-surface-400"
                                    }`}>{m.role}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <select
                                      value={m.role}
                                      onChange={async (e: any) => {
                                        try {
                                          await api.communities.updateMemberRole(c.slug, m.id, e.target.value);
                                          await loadCommunityMembers(c.id, memberSearch);
                                        } catch { alert("Fehler."); }
                                      }}
                                      className="rounded bg-white/5 px-2 py-1 text-[10px] text-surface-400 focus:outline-none"
                                    >
                                      <option value="MEMBER">Member</option>
                                      <option value="MODERATOR">Moderator</option>
                                      <option value="ADMIN">Admin</option>
                                    </select>
                                    <button
                                      onClick={async () => {
                                        if (!confirm(`${m.user.name} wirklich entfernen?`)) return;
                                        try {
                                          await api.admin.removeCommunityMember(c.id, m.id);
                                          await loadCommunityMembers(c.id, memberSearch);
                                        } catch { alert("Fehler."); }
                                      }}
                                      className="rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/20"
                                    >
                                      Entfernen
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
