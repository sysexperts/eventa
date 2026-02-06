import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type EventListItem, type ScrapedEvent, type EventCategory, type MonitoredUrl } from "../lib/api";
import { useAuth } from "../state/auth";
import { categoryLabel, formatDate } from "../lib/format";
import { Button, Input, Label } from "../ui/components";
import { ArtistSelect } from "../ui/ArtistSelect";

const CATEGORIES: EventCategory[] = ["KONZERT", "THEATER", "LESUNG", "COMEDY", "SONSTIGES"];

function toLocalDatetime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
}

function fromLocalDatetime(val: string): string | null {
  if (!val) return null;
  return new Date(val).toISOString();
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function ScrapedEventEditModal({
  event,
  onClose,
  onSaved,
  onApprove,
  onReject,
  promotionTokens,
  isPartner,
  isAdmin,
}: {
  event: ScrapedEvent;
  onClose: () => void;
  onSaved: (updated: ScrapedEvent) => void;
  onApprove: (id: string, promote?: boolean, artistIds?: string[]) => void;
  onReject: (id: string) => void;
  promotionTokens: number;
  isPartner: boolean;
  isAdmin: boolean;
}) {
  const [title, setTitle] = useState(event.title);
  const [shortDescription, setShortDescription] = useState(event.shortDescription);
  const [description, setDescription] = useState(event.description);
  const [category, setCategory] = useState<EventCategory>(event.category);
  const [startsAt, setStartsAt] = useState(toLocalDatetime(event.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalDatetime(event.endsAt));
  const [address, setAddress] = useState(event.address);
  const [city, setCity] = useState(event.city);
  const [imageUrl, setImageUrl] = useState(event.imageUrl || "");
  const [imagePosition, setImagePosition] = useState(50);
  const [ticketUrl, setTicketUrl] = useState(event.ticketUrl || "");
  const [price, setPrice] = useState(event.price || "");
  const [saving, setSaving] = useState(false);
  const [promote, setPromote] = useState(false);
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.scrape.update(event.id, {
        title, shortDescription, description, category,
        startsAt: fromLocalDatetime(startsAt),
        endsAt: fromLocalDatetime(endsAt),
        address, city, imageUrl: imageUrl || undefined, ticketUrl: ticketUrl || undefined,
        price: price || undefined,
      } as any);
      onSaved(res.event);
    } catch {
      alert("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  const previewDate = startsAt
    ? new Date(startsAt).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
    : "Datum auswählen";
  const previewTime = startsAt
    ? new Date(startsAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-8" onClick={onClose}>
      <div className="w-full max-w-6xl rounded-2xl border border-white/[0.08] bg-surface-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Event prüfen & bearbeiten</h2>
            <div className="mt-0.5 text-xs text-surface-500">
              Quelle: <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 underline">{event.sourceUrl}</a>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-white/5 hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>

        {/* Split Layout */}
        <div className="flex flex-col lg:flex-row">
          {/* LEFT: Settings / Form */}
          <div className="flex-1 border-r border-white/[0.06] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Einstellungen
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <Label>Titel</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <Label>Kurzbeschreibung</Label>
                <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={200} />
              </div>

              <div>
                <Label>Beschreibung</Label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-500 outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Kategorie</Label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-500/50"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Preis</Label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="z.B. 15 EUR" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Beginn</Label>
                  <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div>
                  <Label>Ende (optional)</Label>
                  <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Adresse</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div>
                  <Label>Stadt</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Bild-URL</Label>
                <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>

              {imageUrl && (
                <div>
                  <Label>Bildausschnitt</Label>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-surface-500">Oben</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imagePosition}
                      onChange={(e) => setImagePosition(Number(e.target.value))}
                      className="flex-1 accent-accent-500 h-1.5"
                    />
                    <span className="text-[10px] text-surface-500">Unten</span>
                  </div>
                  <div className="mt-1.5 h-24 w-full overflow-hidden rounded-lg border border-white/10">
                    <img src={imageUrl} alt="Vorschau" className="h-full w-full object-cover" style={{ objectPosition: `center ${imagePosition}%` }} onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                </div>
              )}

              <div>
                <Label>Ticket-URL</Label>
                <Input type="url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://..." />
              </div>

              <div>
                <Label>Künstler (optional)</Label>
                <ArtistSelect selectedIds={selectedArtistIds} onChange={setSelectedArtistIds} />
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="w-full lg:w-[420px] shrink-0 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
              Vorschau
            </h3>
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-950">
              {/* Preview Hero Image */}
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-accent-900/30 to-surface-900">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" style={{ objectPosition: `center ${imagePosition}%` }} onError={(e) => (e.currentTarget.style.display = "none")} />
                ) : (
                  <div className="flex h-full items-center justify-center text-surface-600">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="rounded-full bg-accent-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {categoryLabel(category)}
                  </span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-4 space-y-3">
                <h4 className={`text-lg font-bold leading-tight ${title ? "text-white" : "text-surface-600 italic"}`}>
                  {title || "Event-Titel eingeben..."}
                </h4>
                <p className={`text-sm leading-relaxed ${shortDescription ? "text-surface-400" : "text-surface-600 italic"}`}>
                  {shortDescription || "Kurzbeschreibung eingeben..."}
                </p>

                {/* Date & Location */}
                <div className="flex flex-col gap-2 rounded-xl bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    </div>
                    <div>
                      <div className={`font-medium ${startsAt ? "text-white" : "text-surface-600"}`}>{previewDate}</div>
                      {previewTime && <div className="text-xs text-surface-500">{previewTime} Uhr</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <div className={`font-medium ${address || city ? "text-white" : "text-surface-600"}`}>
                        {address || city || "Ort eingeben..."}
                      </div>
                      {address && city && <div className="text-xs text-surface-500">{city}</div>}
                    </div>
                  </div>
                </div>

                {/* Price & Ticket */}
                <div className="flex items-center justify-between">
                  {price ? (
                    <span className="text-sm font-semibold text-accent-400">{price}</span>
                  ) : (
                    <span className="text-xs text-surface-600 italic">Kein Preis</span>
                  )}
                  {ticketUrl ? (
                    <span className="rounded-full bg-accent-500 px-4 py-1.5 text-xs font-semibold text-white">Tickets →</span>
                  ) : (
                    <span className="rounded-full bg-white/5 px-4 py-1.5 text-xs text-surface-600">Kein Ticket-Link</span>
                  )}
                </div>

                {/* Description preview */}
                {description && (
                  <div className="border-t border-white/[0.06] pt-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1.5">Beschreibung</div>
                    <p className="text-xs leading-relaxed text-surface-400 line-clamp-4">{description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] px-6 py-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Speichere..." : "Änderungen speichern"}
          </Button>
          {(isPartner || isAdmin) && promotionTokens > 0 && (
            <label className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={promote}
                onChange={(e: any) => setPromote(e.target.checked)}
                className="accent-amber-400"
              />
              <span className="text-xs font-medium text-amber-400">Promotion ({promotionTokens} Token{promotionTokens !== 1 ? "s" : ""})</span>
            </label>
          )}
          <button
            onClick={() => { handleSave().then(() => onApprove(event.id, promote, selectedArtistIds)); }}
            className="rounded-xl bg-neon-green/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-neon-green disabled:opacity-50"
            disabled={saving}
          >
            {promote ? "Speichern & Promoted Freigeben" : "Speichern & Freigeben"}
          </button>
          <button
            onClick={() => onReject(event.id)}
            className="rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 border border-red-500/20"
          >
            Ablehnen
          </button>
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>Schließen</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user, refresh: refreshAuth } = useAuth();
  const [events, setEvents] = useState<Omit<EventListItem, "organizer">[]>([]);
  const [scraped, setScraped] = useState<ScrapedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<ScrapedEvent | null>(null);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileWebsite, setProfileWebsite] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);

  // Scraping with live progress
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState("");
  const [scrapeLog, setScrapeLog] = useState<string[]>([]);
  const [scrapeProgress, setScrapeProgress] = useState<{ current: number; total: number; eventsFound: number } | null>(null);

  // Partner: Monitored URLs
  const [monitoredUrls, setMonitoredUrls] = useState<MonitoredUrl[]>([]);
  const [newMonitorUrl, setNewMonitorUrl] = useState("");
  const [newMonitorLabel, setNewMonitorLabel] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [scrapingUrlId, setScrapingUrlId] = useState<string | null>(null);

  async function loadEvents() {
    try {
      const res = await api.events.myList();
      setEvents(res.events);
    } catch { setEvents([]); }
  }

  async function loadScraped() {
    try {
      const res = await api.scrape.list("PENDING");
      setScraped(res.events);
    } catch { setScraped([]); }
  }

  async function loadMonitoredUrls() {
    if (!user?.isPartner) return;
    try {
      const res = await api.monitoredUrls.list();
      setMonitoredUrls(res.urls);
    } catch { setMonitoredUrls([]); }
  }

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadEvents(), loadScraped(), loadMonitoredUrls()]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    if (user) {
      setProfileName(user.name);
      setProfileWebsite(user.website || "");
    }
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Event wirklich loeschen?")) return;
    try {
      await api.events.remove(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch { alert("Loeschen fehlgeschlagen."); }
  }

  async function handleSaveProfile() {
    setProfileBusy(true);
    try {
      await api.me.update({ name: profileName, website: profileWebsite || undefined });
      await refreshAuth();
      setEditingProfile(false);
    } catch { alert("Profil konnte nicht gespeichert werden."); }
    finally { setProfileBusy(false); }
  }

  async function handleScrape() {
    if (!scrapeUrl) return;
    setScraping(true);
    setScrapeMsg("");
    setScrapeLog([]);
    setScrapeProgress(null);

    try {
      const res = await fetch(`/api/scrape/trigger-stream?url=${encodeURIComponent(scrapeUrl)}`, {
        credentials: "include",
      });

      if (!res.ok || !res.body) {
        setScrapeMsg("Fehler beim Starten des Scrapings.");
        setScraping(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            setScrapeLog((prev) => [...prev, data.message]);
            if (data.current && data.total) {
              setScrapeProgress({ current: data.current, total: data.total, eventsFound: data.eventsFound || 0 });
            }
            if (data.phase === "done" || data.phase === "error") {
              setScrapeMsg(data.message);
            }
          } catch { /* ignore */ }
        }
      }

      setScrapeUrl("");
      await loadScraped();
    } catch {
      setScrapeMsg("Verbindung zum Server verloren.");
    } finally {
      setScraping(false);
    }
  }

  async function handleApprove(id: string, promote?: boolean, artistIds?: string[]) {
    try {
      await api.scrape.approve(id, promote, artistIds);
      setScraped((prev) => prev.filter((e) => e.id !== id));
      setEditingEvent(null);
      if (promote) { await refreshAuth(); }
      await loadEvents();
    } catch { alert("Freigabe fehlgeschlagen."); }
  }

  async function handleReject(id: string) {
    try {
      await api.scrape.reject(id);
      setScraped((prev) => prev.filter((e) => e.id !== id));
      setEditingEvent(null);
    } catch { alert("Ablehnung fehlgeschlagen."); }
  }

  function handleEventSaved(updated: ScrapedEvent) {
    setScraped((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingEvent(updated);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Edit Modal */}
      {editingEvent && (
        <ScrapedEventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={handleEventSaved}
          onApprove={handleApprove}
          onReject={handleReject}
          promotionTokens={user?.promotionTokens ?? 0}
          isPartner={user?.isPartner ?? false}
          isAdmin={user?.isAdmin ?? false}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Mein Dashboard</h1>
        <Link to="/dashboard/events/new">
          <Button>+ Neues Event</Button>
        </Link>
      </div>

      {/* Profile Section */}
      {user && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">Mein Profil</h2>
              {user.isPartner && (
                <span className="rounded-full bg-neon-green/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neon-green">Partner</span>
              )}
              {user.isAdmin && (
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400">Admin</span>
              )}
            </div>
            {!editingProfile && (
              <button onClick={() => setEditingProfile(true)} className="text-xs font-medium text-accent-400 hover:text-accent-300">
                Bearbeiten
              </button>
            )}
          </div>
          {editingProfile ? (
            <div className="mt-3 space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              </div>
              <div>
                <Label>Website (Event-Seite)</Label>
                <Input type="url" placeholder="https://meine-events.de" value={profileWebsite} onChange={(e) => setProfileWebsite(e.target.value)} />
                <p className="mt-1 text-xs text-surface-500">Deine Veranstaltungsseite, die automatisch nach Events durchsucht wird.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={profileBusy}>{profileBusy ? "Speichere..." : "Speichern"}</Button>
                <Button variant="ghost" onClick={() => setEditingProfile(false)}>Abbrechen</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-1 text-sm">
              <div className="font-medium text-white">{user.name}</div>
              <div className="text-surface-400">{user.email}</div>
              {user.website ? (
                <a href={user.website} target="_blank" rel="noreferrer" className="text-accent-400 hover:text-accent-300">{user.website}</a>
              ) : (
                <div className="text-surface-500">Keine Website hinterlegt</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Partner: Monitored URLs Section */}
      {user?.isPartner && (
        <div className="rounded-2xl border border-neon-green/20 bg-gradient-to-br from-neon-green/5 to-transparent p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-neon-green/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-green">Partner</span>
            <h2 className="text-base font-semibold text-white">Ueberwachte Seiten</h2>
          </div>
          <p className="text-sm text-surface-400">
            Hinterlege die URLs deiner Veranstaltungsseiten. LocalEvents prueft diese taeglich automatisch auf neue Events.
          </p>

          {/* Add new URL */}
          <div className="mt-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="url"
                placeholder="https://meine-events.de/veranstaltungen"
                value={newMonitorUrl}
                onChange={(e: any) => setNewMonitorUrl(e.target.value)}
                className="flex-1"
                disabled={addingUrl}
              />
              <Input
                placeholder="Bezeichnung (optional)"
                value={newMonitorLabel}
                onChange={(e: any) => setNewMonitorLabel(e.target.value)}
                className="sm:w-48"
                disabled={addingUrl}
              />
              <Button
                onClick={async () => {
                  if (!newMonitorUrl) return;
                  setAddingUrl(true);
                  try {
                    await api.monitoredUrls.add({ url: newMonitorUrl, label: newMonitorLabel || undefined });
                    setNewMonitorUrl("");
                    setNewMonitorLabel("");
                    await loadMonitoredUrls();
                  } catch { alert("URL konnte nicht hinzugefuegt werden."); }
                  finally { setAddingUrl(false); }
                }}
                disabled={addingUrl || !newMonitorUrl}
              >
                {addingUrl ? "..." : "+ Hinzufuegen"}
              </Button>
            </div>
          </div>

          {/* URL List */}
          {monitoredUrls.length > 0 && (
            <div className="mt-4 space-y-2">
              {monitoredUrls.map((mu) => (
                <div
                  key={mu.id}
                  className={`rounded-xl border p-4 transition-all ${
                    mu.isActive
                      ? "border-white/[0.08] bg-white/[0.03]"
                      : "border-white/[0.04] bg-white/[0.01] opacity-50"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${mu.isActive ? (mu.errorCount > 0 ? "bg-amber-400" : "bg-neon-green") : "bg-surface-600"}`} />
                        <span className="font-medium text-white truncate">{mu.label || mu.url}</span>
                      </div>
                      <div className="mt-1 text-xs text-surface-500 truncate">{mu.url}</div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-surface-500">
                        {mu.lastScrapedAt && (
                          <span>Letzter Scan: {new Date(mu.lastScrapedAt).toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                        {mu.lastEventCount > 0 && (
                          <span className="text-neon-green">{mu.lastEventCount} neue Events</span>
                        )}
                        {mu.errorCount > 0 && (
                          <span className="text-amber-400">Fehler: {mu.lastError}</span>
                        )}
                        {!mu.lastScrapedAt && <span className="text-surface-600 italic">Noch nicht gescannt</span>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={async () => {
                          setScrapingUrlId(mu.id);
                          try {
                            const result = await api.monitoredUrls.scrapeNow(mu.id);
                            await Promise.all([loadMonitoredUrls(), loadScraped()]);
                            if (result.error) alert(`Fehler: ${result.error}`);
                            else if (result.newEvents === 0) alert(`Keine neuen Events gefunden (${result.skipped} bereits vorhanden).`);
                            else alert(`${result.newEvents} neue Events importiert!`);
                          } catch { alert("Scraping fehlgeschlagen."); }
                          finally { setScrapingUrlId(null); }
                        }}
                        disabled={scrapingUrlId === mu.id}
                        className="rounded-lg bg-accent-500/10 px-3 py-1.5 text-xs font-medium text-accent-400 hover:bg-accent-500/20 disabled:opacity-50 transition-colors"
                      >
                        {scrapingUrlId === mu.id ? "Scannt..." : "Jetzt scannen"}
                      </button>
                      <button
                        onClick={async () => {
                          await api.monitoredUrls.update(mu.id, { isActive: !mu.isActive });
                          await loadMonitoredUrls();
                        }}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-surface-400 hover:bg-white/10 transition-colors"
                      >
                        {mu.isActive ? "Pausieren" : "Aktivieren"}
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("URL wirklich entfernen?")) return;
                          await api.monitoredUrls.remove(mu.id);
                          await loadMonitoredUrls();
                        }}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {monitoredUrls.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 p-6 text-center">
              <div className="text-2xl">🔗</div>
              <p className="mt-2 text-sm text-surface-500">Noch keine URLs hinterlegt. Fuege deine Veranstaltungsseite hinzu!</p>
            </div>
          )}
        </div>
      )}

      {/* Website Scraping Section (non-partner: manual scrape) */}
      <div className="rounded-2xl border border-accent-500/20 bg-gradient-to-br from-accent-500/5 to-transparent p-5">
        <h2 className="text-base font-semibold text-white">{user?.isPartner ? "Einmalig scannen" : "Website indexieren"}</h2>
        <p className="mt-1 text-sm text-surface-400">
          {user?.isPartner
            ? "Scanne eine beliebige URL einmalig nach Events."
            : "Gib die URL deiner Veranstaltungsseite ein. Wir durchsuchen die Seite automatisch nach Events und erstellen Vorschlaege, die du freigeben kannst."
          }
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            placeholder="https://meine-events.de/veranstaltungen"
            value={scrapeUrl}
            onChange={(e: any) => setScrapeUrl(e.target.value)}
            onKeyDown={(e: any) => e.key === "Enter" && handleScrape()}
            className="flex-1"
            disabled={scraping}
          />
          <Button onClick={handleScrape} disabled={scraping || !scrapeUrl}>
            {scraping ? "Durchsuche..." : "Seite durchsuchen"}
          </Button>
        </div>

        {/* Live Progress */}
        {(scraping || scrapeLog.length > 0) && (
          <div className="mt-4 space-y-3">
            {/* Progress bar */}
            {scrapeProgress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-surface-400">
                  <span>Event {scrapeProgress.current} von {scrapeProgress.total}</span>
                  <span className="font-semibold text-neon-green">{scrapeProgress.eventsFound} erkannt</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent-500 transition-all duration-300"
                    style={{ width: `${Math.round((scrapeProgress.current / scrapeProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Scrolling log */}
            <div className="max-h-48 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-300">
              {scrapeLog.map((line, i) => (
                <div key={i} className={`py-0.5 ${line.includes("erkannt:") ? "text-green-400" : line.includes("Fehler") ? "text-red-400" : line.includes("Fertig") || line.includes("gespeichert") ? "text-emerald-400 font-semibold" : ""}`}>
                  <span className="mr-2 text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                  {line}
                </div>
              ))}
              {scraping && (
                <div className="py-0.5 animate-pulse text-amber-400">...</div>
              )}
            </div>
          </div>
        )}

        {/* Final message (when not scraping) */}
        {!scraping && scrapeMsg && scrapeLog.length === 0 && (
          <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-sm text-surface-300">
            {scrapeMsg}
          </div>
        )}
      </div>

      {/* Scraped Event Suggestions */}
      {scraped.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Event-Vorschlaege <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">{scraped.length}</span>
          </h2>
          <p className="text-sm text-surface-400">
            Klicke auf ein Event um es zu pruefen, zu bearbeiten und dann freizugeben oder abzulehnen.
          </p>
          <div className="space-y-3">
            {scraped.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setEditingEvent(ev)}
                className="w-full text-left rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-white">{ev.title}</div>
                    {ev.shortDescription && (
                      <div className="text-sm text-surface-400 line-clamp-2">{ev.shortDescription}</div>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-surface-500">
                      {ev.startsAt && <span>{formatDate(ev.startsAt)}</span>}
                      {ev.city && <span>{ev.city}</span>}
                      {ev.price && <span>{ev.price}</span>}
                      {ev.description && ev.description.length > 50 && (
                        <span className="text-neon-green font-medium">Inhalt vorhanden</span>
                      )}
                      {(!ev.description || ev.description.length <= 50) && (
                        <span className="text-amber-400 font-medium">Inhalt pruefen</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-accent-400 font-medium shrink-0">Pruefen &rarr;</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* My Events */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Meine Events</h2>
        {loading ? (
          <div className="py-8 text-center text-sm text-surface-500">Lade...</div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-8 text-center">
            <div className="text-3xl">📭</div>
            <p className="mt-2 text-sm text-surface-400">Du hast noch keine Events. Erstelle eins oder indexiere deine Website!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="font-semibold text-white">{ev.title}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-surface-500">
                    <span>{categoryLabel(ev.category)}</span>
                    <span>·</span>
                    <span>{formatDate(ev.startsAt)}</span>
                    <span>·</span>
                    <span>{ev.city}</span>
                    {ev.price && <><span>·</span><span className="text-accent-400">{ev.price}</span></>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/events/${ev.id}`}>
                    <Button variant="ghost">Ansehen</Button>
                  </Link>
                  <Link to={`/dashboard/events/${ev.id}/edit`}>
                    <Button variant="ghost">Bearbeiten</Button>
                  </Link>
                  <Button variant="ghost" onClick={() => handleDelete(ev.id)}>
                    Loeschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
