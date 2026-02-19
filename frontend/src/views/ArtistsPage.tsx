import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.artists.list()
      .then((r) => setArtists(r.artists || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.genre || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-surface-950/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Künstler</h1>
          <p className="mt-2 text-surface-400">Entdecke Künstler und ihre kommenden Events</p>
          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Name oder Genre suchen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-surface-500 outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-white/[0.05]" />
                <div className="mt-3 h-4 w-3/4 rounded bg-white/[0.05]" />
                <div className="mt-1.5 h-3 w-1/2 rounded bg-white/[0.03]" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-surface-500">
            {search ? `Keine Künstler für „${search}" gefunden.` : "Noch keine Künstler vorhanden."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((artist) => (
              <Link
                key={artist.id}
                to={`/artists/${artist.slug}`}
                className="group flex flex-col"
              >
                {/* Avatar */}
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-800">
                  {artist.imageUrl ? (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-500/20 to-neon-purple/20 text-3xl font-bold text-white/30">
                      {artist.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 rounded-2xl" />
                  {/* Event count badge */}
                  {artist._count?.events > 0 && (
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {artist._count.events} Event{artist._count.events !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="mt-3 px-0.5">
                  <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-accent-300">
                    {artist.name}
                  </p>
                  {artist.genre && (
                    <p className="mt-0.5 truncate text-xs text-surface-500">{artist.genre}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
