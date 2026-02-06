import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type EventListItem } from "../lib/api";
import { categoryLabel, formatDate } from "../lib/format";

const CATEGORY_ICONS: Record<string, string> = {
  KONZERT: "🎵",
  THEATER: "🎭",
  LESUNG: "📖",
  COMEDY: "😂",
  SONSTIGES: "✨",
};

const CATEGORIES = [
  { value: "", label: "Alle" },
  { value: "KONZERT", label: "Konzerte" },
  { value: "THEATER", label: "Theater" },
  { value: "LESUNG", label: "Lesungen" },
  { value: "COMEDY", label: "Comedy" },
  { value: "SONSTIGES", label: "Sonstiges" },
];

type MyEvent = Omit<EventListItem, "organizer">;

function isExpired(ev: MyEvent): boolean {
  const end = ev.endsAt || ev.startsAt;
  return new Date(end) < new Date();
}

function EventRow({ ev, expired, onDelete }: { ev: MyEvent; expired: boolean; onDelete: (id: string) => void }) {
  return (
    <div
      className={`group flex flex-col gap-4 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center ${
        expired
          ? "border-white/[0.04] bg-white/[0.01] opacity-50 hover:opacity-70"
          : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]"
      }`}
    >
      {/* Image */}
      <Link to={`/events/${ev.id}`} className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-36">
        {ev.imageUrl ? (
          <img src={ev.imageUrl} alt={ev.title} className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${expired ? "grayscale" : ""}`} />
        ) : (
          <div className={`flex h-full items-center justify-center bg-gradient-to-br from-accent-900/50 to-surface-900 text-3xl ${expired ? "grayscale" : ""}`}>
            {CATEGORY_ICONS[ev.category] || "🎉"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {expired && (
          <div className="absolute inset-x-0 top-0 flex items-center justify-center">
            <span className="mt-1.5 rounded-full bg-surface-800/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-surface-400">
              Abgelaufen
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <Link to={`/events/${ev.id}`} className={`truncate text-base font-semibold transition-colors ${expired ? "text-surface-400 hover:text-surface-300" : "text-white hover:text-accent-300"}`}>
          {ev.title}
        </Link>
        <p className={`text-sm line-clamp-1 ${expired ? "text-surface-600" : "text-surface-400"}`}>{ev.shortDescription}</p>
        <div className={`mt-1 flex flex-wrap items-center gap-3 text-xs ${expired ? "text-surface-600" : "text-surface-500"}`}>
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            {formatDate(ev.startsAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {ev.city}
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5">{categoryLabel(ev.category)}</span>
          {ev.price && <span className={`font-medium ${expired ? "text-surface-600" : "text-accent-400"}`}>{ev.price}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          to={`/dashboard/events/${ev.id}/edit`}
          className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-surface-300 transition-all hover:border-white/20 hover:text-white"
        >
          Bearbeiten
        </Link>
        <button
          onClick={() => onDelete(ev.id)}
          className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/30"
        >
          Löschen
        </button>
      </div>
    </div>
  );
}

export function MyEventsPage() {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    api.events
      .myList()
      .then((r) => setEvents(r.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Event wirklich löschen?")) return;
    try {
      await api.events.remove(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Löschen fehlgeschlagen.");
    }
  }

  const filtered = useMemo(() => {
    let list = events;
    if (category) list = list.filter((e) => e.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.shortDescription.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, category, search]);

  const active = useMemo(() => filtered.filter((e) => !isExpired(e)).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [filtered]);
  const expired = useMemo(() => filtered.filter((e) => isExpired(e)).sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()), [filtered]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Meine Events</h1>
          <p className="mt-1 text-sm text-surface-400">
            {events.length} Event{events.length !== 1 ? "s" : ""} &middot; {active.length} aktiv &middot; {expired.length} abgelaufen
          </p>
        </div>
        <Link
          to="/dashboard/events/new"
          className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400 hover:shadow-accent-500/40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Neues Event
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            type="text"
            placeholder="Events durchsuchen..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-accent-500/25"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(category === c.value ? "" : c.value)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                category === c.value
                  ? "bg-accent-500 text-white shadow-lg shadow-accent-500/25"
                  : "bg-white/[0.04] text-surface-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      )}

      {/* Empty State - no events at all */}
      {!loading && events.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <div className="text-5xl">📭</div>
          <h3 className="mt-4 text-lg font-semibold text-white">Noch keine Events</h3>
          <p className="mt-2 text-sm text-surface-400">
            Erstelle dein erstes Event oder indexiere deine Website im{" "}
            <Link to="/dashboard" className="text-accent-400 hover:text-accent-300 transition-colors">Dashboard</Link>.
          </p>
          <Link
            to="/dashboard/events/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Event erstellen
          </Link>
        </div>
      )}

      {/* No results for filter/search */}
      {!loading && events.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <div className="text-4xl">🔍</div>
          <h3 className="mt-3 text-base font-semibold text-white">Keine Treffer</h3>
          <p className="mt-1 text-sm text-surface-400">Versuche andere Suchbegriffe oder Filter.</p>
          <button
            onClick={() => { setSearch(""); setCategory(""); }}
            className="mt-4 rounded-lg bg-white/[0.06] px-4 py-2 text-xs font-medium text-surface-300 transition-all hover:bg-white/[0.1] hover:text-white"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      {/* Active Events */}
      {!loading && active.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-surface-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Aktive Events ({active.length})
          </h2>
          {active.map((ev) => (
            <EventRow key={ev.id} ev={ev} expired={false} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Expired Events */}
      {!loading && expired.length > 0 && (
        <div className={`space-y-3 ${active.length > 0 ? "mt-10" : ""}`}>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-surface-500">
            <span className="h-2 w-2 rounded-full bg-surface-600" />
            Abgelaufene Events ({expired.length})
          </h2>
          {expired.map((ev) => (
            <EventRow key={ev.id} ev={ev} expired={true} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
