import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type EventListItem, type ScrapedEvent, type EventCategory } from "../lib/api";
import { useAuth } from "../state/auth";
import { categoryLabel, formatDate } from "../lib/format";
import { Button, Input, Label } from "../ui/components";

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
}: {
  event: ScrapedEvent;
  onClose: () => void;
  onSaved: (updated: ScrapedEvent) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
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
  const [ticketUrl, setTicketUrl] = useState(event.ticketUrl || "");
  const [price, setPrice] = useState(event.price || "");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-surface-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Event pruefen & bearbeiten</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div className="mb-3 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-300 border border-amber-500/20">
          Quelle: <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="underline">{event.sourceUrl}</a>
        </div>

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
              rows={6}
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
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="z.B. 15 EUR oder Eintritt frei" />
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
            {imageUrl && (
              <img src={imageUrl} alt="Vorschau" className="h-32 w-full rounded-lg object-cover ring-1 ring-white/10" onError={(e) => (e.currentTarget.style.display = "none")} />
            )}
          </div>

          <div>
            <Label>Ticket-URL</Label>
            <Input type="url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Speichere..." : "Aenderungen speichern"}
          </Button>
          <button
            onClick={() => { handleSave().then(() => onApprove(event.id)); }}
            className="rounded-xl bg-neon-green/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-neon-green disabled:opacity-50"
            disabled={saving}
          >
            Speichern & Freigeben
          </button>
          <button
            onClick={() => onReject(event.id)}
            className="rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 border border-red-500/20"
          >
            Ablehnen
          </button>
          <Button variant="ghost" onClick={onClose}>Schliessen</Button>
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

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadEvents(), loadScraped()]);
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

  async function handleApprove(id: string) {
    try {
      await api.scrape.approve(id);
      setScraped((prev) => prev.filter((e) => e.id !== id));
      setEditingEvent(null);
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
    <div className="space-y-8">
      {/* Edit Modal */}
      {editingEvent && (
        <ScrapedEventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={handleEventSaved}
          onApprove={handleApprove}
          onReject={handleReject}
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
            <h2 className="text-base font-semibold text-white">Mein Profil</h2>
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

      {/* Website Scraping Section */}
      <div className="rounded-2xl border border-accent-500/20 bg-gradient-to-br from-accent-500/5 to-transparent p-5">
        <h2 className="text-base font-semibold text-white">Website indexieren</h2>
        <p className="mt-1 text-sm text-surface-400">
          Gib die URL deiner Veranstaltungsseite ein. Wir durchsuchen die Seite automatisch nach Events und erstellen Vorschlaege, die du freigeben kannst.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            placeholder="https://meine-events.de/veranstaltungen"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
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
