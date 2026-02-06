import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type EventListItem } from "../lib/api";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

export function FavoritesPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await api.events.favorites();
      setEvents(res.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUnfavorite(id: string) {
    await api.events.toggleFavorite(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Meine Favoriten</h1>
        <p className="mt-1 text-sm text-surface-400">Events, die du mit einem Herz markiert hast</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-surface-500">Lade...</div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
          <div className="text-4xl">💔</div>
          <p className="mt-3 text-surface-400">Du hast noch keine Favoriten.</p>
          <Link to="/events" className="mt-4 inline-block rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 hover:bg-accent-400 transition-all">
            Events entdecken
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div key={ev.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all hover:border-white/[0.12] hover:bg-white/[0.05]">
              {/* Unfavorite button */}
              <button
                onClick={() => handleUnfavorite(ev.id)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-red-400 hover:text-red-300 hover:bg-black/70 transition-all"
                title="Aus Favoriten entfernen"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>

              <Link to={`/events/${ev.id}`}>
                {ev.imageUrl ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-accent-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-3xl opacity-30">🎵</span>
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-white line-clamp-1">{ev.title}</h3>
                  {ev.shortDescription && (
                    <p className="text-xs text-surface-400 line-clamp-2">{ev.shortDescription}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-surface-500">
                    {ev.startsAt && <span>{formatDate(ev.startsAt)}</span>}
                    {ev.city && <><span>·</span><span>{ev.city}</span></>}
                    {ev.price && <><span>·</span><span className="text-accent-400">{ev.price}</span></>}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
