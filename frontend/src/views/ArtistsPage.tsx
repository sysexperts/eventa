import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";

const GENRES = [
  "Alle",
  "Rock",
  "Pop",
  "Hip-Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Metal",
  "Indie",
  "Folk",
  "R&B",
  "Country",
  "Reggae",
  "Blues",
  "Punk",
  "Soul",
];

const FLAG_CDN = "https://hatscripts.github.io/circle-flags/flags";

const CULTURES = [
  { slug: "turkish",       name: "Türkisch",      flag: "tr", img: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "croatian",      name: "Kroatisch",      flag: "hr", img: "https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "polish",        name: "Polnisch",       flag: "pl", img: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "romanian",      name: "Rumänisch",      flag: "ro", img: "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "italian",       name: "Italienisch",    flag: "it", img: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "greek",         name: "Griechisch",     flag: "gr", img: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "bulgarian",     name: "Bulgarisch",     flag: "bg", img: "https://images.pexels.com/photos/4388164/pexels-photo-4388164.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "russian",       name: "Russisch",       flag: "ru", img: "https://images.pexels.com/photos/753339/pexels-photo-753339.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "persian",       name: "Persisch",       flag: "ir", img: "https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "spanish",       name: "Spanisch",       flag: "es", img: "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "balkan",        name: "Balkan",         flag: "rs", img: "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "latin",         name: "Lateinamerika",  flag: "br", img: "https://images.pexels.com/photos/2868242/pexels-photo-2868242.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "african",       name: "Afrikanisch",    flag: "ng", img: "https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "kurdish",       name: "Kurdisch",       flag: "iq", img: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "international", name: "International",  flag: "eu", img: "https://images.pexels.com/photos/1098460/pexels-photo-1098460.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

export function ArtistsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Alle");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [displayLimit, setDisplayLimit] = useState(50);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const fallback = CULTURES.map((c) => ({ slug: c.slug, name: c.name, flag: c.flag, flagUrl: "", img: c.img }));
  const [communities, setCommunities] = useState(fallback);

  useEffect(() => {
    api.artists.list()
      .then((r) => setArtists(r.artists || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.communities.list()
      .then((r) => {
        if (!r.communities?.length) return;
        const homepageCommunities = r.communities.filter((c: any) => c.showOnHomepage);
        if (!homepageCommunities.length) return;
        const cultureMap = new Map(CULTURES.map((c) => [c.slug, c]));
        const cultureOrder = new Map(CULTURES.map((c, i) => [c.slug, i]));
        const mapped = homepageCommunities.map((db: any) => {
          const fallbackC = cultureMap.get(db.slug);
          return {
            slug: db.slug,
            name: db.name || fallbackC?.name || db.slug,
            flag: (db.flagCode || db.country || fallbackC?.flag || "eu").toLowerCase(),
            flagUrl: db.flagUrl || "",
            img: fallbackC?.img || db.bannerUrl || db.imageUrl || "",
          };
        });
        mapped.sort((a: any, b: any) => (cultureOrder.get(a.slug) ?? 99) - (cultureOrder.get(b.slug) ?? 99));
        setCommunities(mapped);
      })
      .catch(() => {});
  }, []);

  const filtered = artists.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.genre || "").toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === "Alle" || 
      (a.genre || "").toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesCommunity = !selectedCommunity || 
      (a.tags || []).some((tag: string) => tag.toLowerCase() === selectedCommunity.toLowerCase());
    return matchesSearch && matchesGenre && matchesCommunity;
  });

  const displayed = filtered.slice(0, displayLimit);
  const hasMore = filtered.length > displayLimit;

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setDisplayLimit(prev => prev + 50);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

  const canCreateArtist = user && (user.isPartner || user.isAdmin);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-surface-950/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Künstler</h1>
                <span className="rounded-full bg-accent-500/20 px-3 py-1 text-sm font-semibold text-accent-400">
                  {artists.length.toLocaleString("de-DE")}
                </span>
              </div>
              <p className="mt-1 text-sm text-surface-400">Entdecke Künstler und ihre kommenden Events</p>
            </div>
            {canCreateArtist && (
              <button
                onClick={() => navigate("/admin/artists?create=true")}
                className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Künstler erstellen
              </button>
            )}
          </div>
          {/* Search - Compact */}
          <div className="mt-4">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Künstler suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-surface-900/60 py-2 pl-10 pr-3 text-sm text-white placeholder-surface-400 outline-none transition-all focus:border-accent-500/40"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="py-6">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent-400">Communities</p>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Nach Community filtern</h2>
            </div>
          </div>
        </div>

        {/* Community avatars */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {/* Alle Button */}
            <button
              onClick={() => setSelectedCommunity("")}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div className={`absolute -inset-[3px] rounded-full transition-opacity duration-300 ${
                  !selectedCommunity ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                  style={{ background: "linear-gradient(135deg, #3366ff, #a855f7, #ec4899)" }} />
                <div className={`absolute -inset-[3px] rounded-full ring-2 ring-white/10 transition-opacity duration-300 ${
                  !selectedCommunity ? "opacity-0" : "group-hover:opacity-0"
                }`} />
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-500/20 to-purple-600/20 sm:h-20 sm:w-20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-400">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20"/>
                  </svg>
                </div>
              </div>
              <span className={`text-xs font-medium transition-colors duration-200 sm:text-sm ${
                !selectedCommunity ? "text-white" : "text-surface-400 group-hover:text-white"
              }`}>
                Alle
              </span>
            </button>
            
            {communities.slice(0, 7).map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCommunity(c.slug)}
                className="group flex flex-col items-center gap-3"
              >
                {/* Circle */}
                <div className="relative">
                  {/* Animated gradient ring on hover or selected */}
                  <div className={`absolute -inset-[3px] rounded-full transition-opacity duration-300 ${
                    selectedCommunity === c.slug ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                    style={{ background: "linear-gradient(135deg, #3366ff, #a855f7, #ec4899)" }} />
                  {/* Default subtle ring */}
                  <div className={`absolute -inset-[3px] rounded-full ring-2 ring-white/10 transition-opacity duration-300 ${
                    selectedCommunity === c.slug ? "opacity-0" : "group-hover:opacity-0"
                  }`} />
                  {/* Image */}
                  <div className="relative h-16 w-16 overflow-hidden rounded-full sm:h-20 sm:w-20">
                    <img
                      src={c.img}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/25 transition-opacity duration-300 group-hover:opacity-0" />
                  </div>
                  {/* Flag */}
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 overflow-hidden rounded-full ring-[2.5px] ring-[rgb(9,9,11)]">
                    <img
                      src={c.flagUrl || `${FLAG_CDN}/${c.flag.toLowerCase()}.svg`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                {/* Name */}
                <span className={`community-name text-xs font-medium transition-colors duration-200 sm:text-sm ${
                  selectedCommunity === c.slug ? "text-white" : "text-surface-400 group-hover:text-white"
                }`}>
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Genre Pills - Compact */}
      <div className="border-b border-white/[0.06] bg-surface-950/20 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedGenre === genre
                    ? "bg-gradient-to-r from-accent-500 to-purple-500 text-white shadow-lg shadow-accent-500/30"
                    : "bg-surface-800/60 text-surface-300 hover:bg-surface-800 hover:text-white"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
          <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {displayed.map((artist) => (
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
          {hasMore && (
            <div ref={observerTarget} className="mt-8 flex justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent-500" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent-500" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-accent-500" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
