import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type EventListItem } from "../lib/api";
import { categoryLabel, formatDate } from "../lib/format";
import { Input, Button } from "../ui/components";

const CATEGORIES = [
  { value: "", label: "Alle", icon: "🔥" },
  { value: "KONZERT", label: "Konzerte", icon: "🎵" },
  { value: "THEATER", label: "Theater", icon: "🎭" },
  { value: "LESUNG", label: "Lesungen", icon: "📖" },
  { value: "COMEDY", label: "Comedy", icon: "😂" },
  { value: "SONSTIGES", label: "Sonstiges", icon: "✨" },
];

const CATEGORY_ICONS: Record<string, string> = {
  KONZERT: "🎵",
  THEATER: "🎭",
  LESUNG: "📖",
  COMEDY: "😂",
  SONSTIGES: "✨",
};

export function EventsPage() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [view, setView] = useState<"grid" | "list">("grid");

  async function load() {
    setLoading(true);
    try {
      const res = await api.events.list({ category, city, q: q || undefined });
      setEvents(res.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [category, city]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Events entdecken
        </h1>
        <p className="mt-2 text-base text-surface-400">Finde Veranstaltungen in deiner Nähe</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <Input
            placeholder="Events suchen…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="!pl-10"
          />
        </div>
        <div className="sm:w-44">
          <Input
            placeholder="Stadt"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <Button onClick={load} className="!px-6">
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Suchen
          </span>
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              category === c.value
                ? "bg-accent-500 text-white shadow-lg shadow-accent-500/25"
                : "border border-white/[0.08] bg-white/[0.03] text-surface-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span className="text-sm">{c.icon}</span>
            {c.label}
          </button>
        ))}

        {/* View toggle */}
        <div className="ml-auto flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
          <button
            onClick={() => setView("grid")}
            className={`rounded-md p-1.5 transition-colors ${view === "grid" ? "bg-white/10 text-white" : "text-surface-500 hover:text-white"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-md p-1.5 transition-colors ${view === "list" ? "bg-white/10 text-white" : "text-surface-500 hover:text-white"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-700 border-t-accent-500" />
          <p className="mt-4 text-sm text-surface-500">Events werden geladen…</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">🔍</div>
          <p className="mt-4 text-base font-medium text-surface-300">Keine Events gefunden</p>
          <p className="mt-1 text-sm text-surface-500">Versuche andere Suchkriterien oder eine andere Kategorie.</p>
          <button
            onClick={() => { setCategory(""); setQ(""); setCity(""); }}
            className="mt-4 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-surface-500">
              <span className="font-semibold text-white">{events.length}</span> Event{events.length !== 1 ? "s" : ""} gefunden
            </p>
          </div>

          {view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/events/${ev.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-accent-500/5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {ev.imageUrl ? (
                      <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-900/50 to-surface-900 text-5xl">
                        {CATEGORY_ICONS[ev.category] || "🎉"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />

                    <div className="absolute left-3 top-3 flex gap-2">
                      {ev.isFeatured && (
                        <span className="rounded-full bg-neon-green/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-surface-950">
                          Featured
                        </span>
                      )}
                    </div>
                    {ev.price && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                        {ev.price}
                      </span>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-[11px] font-medium text-white/70">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 backdrop-blur-sm">
                          {categoryLabel(ev.category)}
                        </span>
                        <span>{formatDate(ev.startsAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-semibold leading-snug text-white group-hover:text-accent-300 transition-colors">
                      {ev.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-surface-400 line-clamp-2">{ev.shortDescription}</p>

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-surface-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {ev.city}
                      </div>
                      {ev.ticketUrl && (
                        <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent-400">
                          Tickets
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/events/${ev.id}`}
                  className="group flex gap-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06]"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-36">
                    {ev.imageUrl ? (
                      <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-900/50 to-surface-900 text-2xl">
                        {CATEGORY_ICONS[ev.category] || "🎉"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center py-1">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-surface-500">
                      <span>{categoryLabel(ev.category)}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-surface-600" />
                      <span>{formatDate(ev.startsAt)}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-surface-600" />
                      <span>{ev.city}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-white group-hover:text-accent-300 transition-colors sm:text-base">
                      {ev.title}
                    </h3>
                    <p className="mt-1 hidden text-sm text-surface-400 line-clamp-1 sm:block">{ev.shortDescription}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {ev.isFeatured && (
                        <span className="rounded-full bg-neon-green/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-surface-950">
                          Featured
                        </span>
                      )}
                      {ev.price && (
                        <span className="text-xs font-semibold text-surface-300">{ev.price}</span>
                      )}
                      {ev.ticketUrl && (
                        <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-semibold text-accent-400">
                          Tickets
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden items-center sm:flex">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-600 transition-colors group-hover:text-accent-400"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
