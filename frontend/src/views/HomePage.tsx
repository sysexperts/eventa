import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type EventListItem } from "../lib/api";
import { categoryLabel, formatDate } from "../lib/format";
import { FavoriteButton } from "../ui/FavoriteButton";
import { useAuth } from "../state/auth";

const CATEGORY_ICONS: Record<string, string> = {
  KONZERT: "🎵",
  THEATER: "🎭",
  LESUNG: "📖",
  COMEDY: "😂",
  SONSTIGES: "✨",
};

const CATEGORIES = [
  { label: "Konzerte", cat: "KONZERT", img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80" },
  { label: "Theater", cat: "THEATER", img: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80" },
  { label: "Lesungen", cat: "LESUNG", img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80" },
  { label: "Comedy", cat: "COMEDY", img: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80" },
  { label: "Sonstiges", cat: "SONSTIGES", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80" },
];

function EventCard({ ev, size = "normal", isFavorited = false, onToggle }: { ev: EventListItem; size?: "normal" | "compact"; isFavorited?: boolean; onToggle?: (eventId: string, favorited: boolean) => void }) {
  const isPast = new Date(ev.startsAt) < new Date();

  if (size === "compact") {
    return (
      <Link
        to={`/events/${ev.id}`}
        className={`group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.05] ${isPast ? "opacity-50 grayscale" : ""}`}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          {ev.imageUrl ? (
            <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-900/50 to-surface-900 text-2xl">
              {CATEGORY_ICONS[ev.category] || "🎉"}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] font-medium text-surface-500">
            <span>{categoryLabel(ev.category)}</span>
            <span>·</span>
            <span>{formatDate(ev.startsAt)}</span>
          </div>
          <h3 className="mt-0.5 truncate text-sm font-semibold text-white group-hover:text-accent-300 transition-colors">
            {ev.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-surface-500">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {ev.city}
          </div>
        </div>
        {ev.price && (
          <div className="flex shrink-0 items-center">
            <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold text-accent-400">{ev.price}</span>
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={`/events/${ev.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-accent-500/5 ${isPast ? "opacity-60 grayscale" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {ev.imageUrl ? (
          <img
            src={ev.imageUrl}
            alt={ev.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-900/50 to-surface-900 text-5xl">
            {CATEGORY_ICONS[ev.category] || "🎉"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />

        <div className="absolute left-3 top-3 flex gap-2">
          {isPast && (
            <span className="rounded-full bg-surface-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Abgelaufen
            </span>
          )}
          {ev.isFeatured && !isPast && (
            <span className="rounded-full bg-neon-green/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-surface-950">
              Featured
            </span>
          )}
          {ev.isPromoted && !isPast && (
            <span className="rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-surface-950">
              Promoted
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {ev.price && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {ev.price}
            </span>
          )}
          {onToggle && <FavoriteButton eventId={ev.id} isFavorited={isFavorited} onToggle={onToggle} />}
        </div>

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
          {ev.tags.length > 0 && (
            <div className="flex gap-1">
              {ev.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-surface-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ title, subtitle, linkTo, linkLabel }: { title: string; subtitle?: string; linkTo?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-surface-500">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="group hidden items-center gap-1 text-sm font-medium text-accent-400 transition-colors hover:text-accent-300 sm:inline-flex"
        >
          {linkLabel || "Alle anzeigen"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      )}
    </div>
  );
}

function getWeekendRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay();
  const fri = new Date(now);
  fri.setDate(now.getDate() + ((5 - day + 7) % 7 || 7));
  if (day >= 5 || day === 0) fri.setDate(now.getDate());
  fri.setHours(0, 0, 0, 0);
  const sun = new Date(fri);
  sun.setDate(fri.getDate() + (fri.getDay() === 0 ? 0 : 7 - fri.getDay()));
  sun.setHours(23, 59, 59, 999);
  return { from: fri.toISOString(), to: sun.toISOString() };
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Morgen";
  if (diffDays === 2) return "Übermorgen";
  if (diffDays <= 7) {
    return date.toLocaleDateString("de-DE", { weekday: "long" });
  }
  return formatDate(iso);
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)([?#]|$)/i.test(url) || url.includes("/video/");
}

const HERO_INTERVAL = 6000;
const VIDEO_FALLBACK_DURATION = 60000;
const FALLBACK_IMG = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=60";

function HeroSection({ featured, searchQuery, setSearchQuery, onSearch, navigate }: {
  featured: EventListItem[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  navigate: (path: string) => void;
}) {
  const heroImages = useMemo(() => featured.filter((e) => e.imageUrl).slice(0, 6), [featured]);
  const count = heroImages.length;
  const [activeIdx, setActiveIdx] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const videoTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Dynamic hero text from admin settings
  const [heroLine1, setHeroLine1] = useState("Entdecke Events");
  const [heroLine2, setHeroLine2] = useState("in deiner N\u00e4he");
  const [heroSubtitle, setHeroSubtitle] = useState("Konzerte, Theater, Lesungen, Comedy und mehr \u2013 finde Veranstaltungen, die dich begeistern.");
  const [heroBadge, setHeroBadge] = useState("Neue Events in deiner N\u00e4he");
  const [heroGradientLine, setHeroGradientLine] = useState<"1" | "2">("2");

  useEffect(() => {
    api.admin.getSettings().then((res) => {
      const s = res.settings;
      if (s.heroLine1) setHeroLine1(s.heroLine1);
      if (s.heroLine2) setHeroLine2(s.heroLine2);
      if (s.heroSubtitle) setHeroSubtitle(s.heroSubtitle);
      if (s.heroBadge) setHeroBadge(s.heroBadge);
      if (s.heroGradientLine) setHeroGradientLine(s.heroGradientLine as "1" | "2");
    }).catch(() => {});
  }, []);

  const activeEvent = heroImages[activeIdx];
  const heroVideo = activeEvent?.heroVideoUrl && isVideoUrl(activeEvent.heroVideoUrl) ? activeEvent.heroVideoUrl : null;
  const showVideo = videoEnabled && !!heroVideo;

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoTimerRef.current) clearTimeout(videoTimerRef.current);

    if (count <= 1) return;

    if (showVideo) {
      // Video slide: wait longer before advancing
      videoTimerRef.current = setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % count);
      }, VIDEO_FALLBACK_DURATION);
    } else {
      timerRef.current = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % count);
      }, HERO_INTERVAL);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
    };
  }, [count, activeIdx, showVideo]);

  return (
    <section className="relative min-h-[520px] overflow-hidden sm:min-h-[600px] lg:min-h-[680px]">
      {/* Background images with crossfade + Ken Burns */}
      {heroImages.length > 0 ? (
        heroImages.map((ev, i) => (
          <div
            key={ev.id}
            className="absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-[1500ms] ease-in-out"
            style={{
              backgroundImage: `url(${ev.imageUrl})`,
              backgroundPosition: `center ${(ev as any).heroFocusY ?? 50}%`,
              opacity: i === activeIdx ? 1 : 0,
              animation: i === activeIdx ? "heroKenBurns 12s ease-in-out infinite alternate" : "none",
            }}
          />
        ))
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.15]"
          style={{ backgroundImage: `url(${FALLBACK_IMG})` }}
        />
      )}

      {/* Video overlay */}
      {showVideo && heroVideo && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <video
            key={`hp-vid-${activeIdx}`}
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Video toggle button */}
      {heroVideo && (
        <button
          onClick={() => setVideoEnabled((p) => !p)}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white hover:scale-110"
          style={{ zIndex: 10 }}
          title={videoEnabled ? "Video deaktivieren" : "Video aktivieren"}
        >
          {videoEnabled ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          )}
        </button>
      )}

      {/* Dark overlays */}
      <div className="absolute inset-0" style={{ zIndex: 2, background: "linear-gradient(to bottom, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.35) 30%, rgba(10,10,10,0.6) 55%, rgba(10,10,10,0.92) 75%, #0a0a0a 90%)" }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" style={{ zIndex: 2 }} />
      {/* Extra bottom fade for seamless transition */}
      <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #0a0a0a)" }} />
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-accent-500/10 blur-[140px] animate-glow-pulse" />
      <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-neon-purple/10 blur-[140px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-neon-cyan/5 blur-[100px] animate-float" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-36" style={{ zIndex: 3 }}>
        <div className="mx-auto max-w-3xl text-center">
          {/* Animated badge */}
          <div className="mb-6 animate-fade-in inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2 text-xs font-medium text-surface-300 backdrop-blur-xl shadow-lg shadow-black/10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
            </span>
            {heroBadge}
          </div>

          {/* Headline with stagger animation */}
          <h1 className="animate-slide-up text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className={heroGradientLine === "1" ? "mt-2 block bg-gradient-to-r from-accent-300 via-neon-purple to-accent-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer drop-shadow-lg" : "drop-shadow-[0_4px_32px_rgba(51,102,255,0.15)]"}>
              {heroLine1}
            </span>
            <span className={heroGradientLine === "2" ? "mt-2 block bg-gradient-to-r from-accent-300 via-neon-purple to-accent-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer drop-shadow-lg" : "mt-2 block drop-shadow-[0_4px_32px_rgba(51,102,255,0.15)]"}>
              {heroLine2}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-slide-up-delay mx-auto mt-6 max-w-xl text-base leading-relaxed text-surface-300/90 sm:text-lg">
            {heroSubtitle}
          </p>

          {/* Search Bar with glassmorphism */}
          <form onSubmit={onSearch} className="animate-slide-up-delay-2 mx-auto mt-10">
            <div className="group/search relative">
              {/* Glow effect behind search bar */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-500/20 via-neon-purple/10 to-accent-500/20 opacity-0 blur-xl transition-opacity duration-500 group-focus-within/search:opacity-100" />
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-5 text-surface-400 transition-colors duration-300 group-focus-within/search:text-accent-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach Events, Künstlern, Orten..."
                  className="w-full rounded-full border border-white/[0.12] bg-white/[0.06] py-2 pl-14 pr-32 text-[15px] text-white placeholder-surface-500 outline-none backdrop-blur-2xl transition-all duration-300 focus:border-accent-500/40 focus:bg-white/[0.1] focus:shadow-[0_0_30px_rgba(51,102,255,0.12)] focus:ring-1 focus:ring-accent-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:shadow-accent-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Suchen
                </button>
              </div>
            </div>

            {/* Quick search suggestions */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-surface-500/80 font-medium">Beliebt:</span>
              {["Konzert", "Comedy", "Theater", "Open Air", "DJ"].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => navigate(`/events?q=${encodeURIComponent(term)}`)}
                  className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3.5 py-1.5 text-surface-400 backdrop-blur-sm transition-all duration-200 hover:border-accent-500/30 hover:bg-accent-500/10 hover:text-white hover:shadow-sm hover:shadow-accent-500/10"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Active event info badge */}
        {activeEvent && (
          <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center">
            <Link
              to={`/events/${activeEvent.id}`}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-md transition-all hover:bg-black/40 hover:border-white/20"
            >
              <span className="text-[11px] font-medium text-surface-400">Jetzt im Fokus</span>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{activeEvent.title}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent-400 shrink-0"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        )}

        {/* Slide indicators */}
        {heroImages.length > 1 && (
          <div className="mx-auto mt-6 flex items-center justify-center gap-1.5">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === activeIdx ? "w-6 bg-accent-500" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ken Burns keyframes */}
      <style>{`
        @keyframes heroKenBurns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }
      `}</style>
    </section>
  );
}

const FLAG_CDN = "https://hatscripts.github.io/circle-flags/flags";

const COMMUNITY_ITEMS = [
  { value: "turkish", label: "Türkisch", code: "tr", img: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=400&q=80" },
  { value: "greek", label: "Griechisch", code: "gr", img: "https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=400&q=80" },
  { value: "romanian", label: "Rumänisch", code: "ro", img: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=400&q=80" },
  { value: "arabic", label: "Arabisch", code: "sa", img: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=400&q=80" },
  { value: "polish", label: "Polnisch", code: "pl", img: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=400&q=80" },
  { value: "italian", label: "Italienisch", code: "it", img: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400&q=80" },
  { value: "balkan", label: "Balkan", code: "rs", img: "https://images.unsplash.com/photo-1555990538-1e15a2d6b7a3?auto=format&fit=crop&w=400&q=80" },
  { value: "latin", label: "Lateinamerika", code: "br", img: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=400&q=80" },
  { value: "african", label: "Afrikanisch", code: "ng", img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80" },
  { value: "persian", label: "Persisch", code: "ir", img: "https://images.unsplash.com/photo-1565711561500-49678a10a63f?auto=format&fit=crop&w=400&q=80" },
  { value: "kurdish", label: "Kurdisch", code: "iq", img: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=400&q=80" },
  { value: "russian", label: "Russisch", code: "ru", img: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=400&q=80" },
  { value: "spanish", label: "Spanisch", code: "es", img: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=400&q=80" },
  { value: "portuguese", label: "Portugiesisch", code: "pt", img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=400&q=80" },
  { value: "asian", label: "Asiatisch", code: "cn", img: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=400&q=80" },
  { value: "international", label: "International", code: "eu", img: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80" },
];

function CommunityCarousel() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">Communities</h2>
          <p className="mt-1 text-sm text-surface-400">Finde Events deiner Kultur</p>
        </div>
        <Link to="/events" className="text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors">
          Alle anzeigen &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
        {COMMUNITY_ITEMS.map((c) => (
          <Link
            key={c.value}
            to={`/events?community=${c.value}`}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-300 hover:border-white/[0.15] hover:scale-[1.03] hover:shadow-lg hover:shadow-black/20"
          >
            <div className="relative aspect-[3/4] w-full">
              <img
                src={c.img}
                alt={c.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 transition-opacity duration-300 group-hover:from-black/70 group-hover:via-black/30 group-hover:to-black/10" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-3 pb-4">
                <img
                  src={`${FLAG_CDN}/${c.code}.svg`}
                  alt={c.label}
                  className="h-8 w-8 sm:h-10 sm:w-10 mb-1.5 rounded-full shadow-lg shadow-black/30 ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-xs font-bold text-center leading-tight drop-shadow-md text-white/90 group-hover:text-white transition-colors">
                  {c.label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featured, setFeatured] = useState<EventListItem[]>([]);
  const [upcoming, setUpcoming] = useState<EventListItem[]>([]);
  const [weekendEvents, setWeekendEvents] = useState<EventListItem[]>([]);
  const [cities, setCities] = useState<{ name: string; count: number }[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.events.featured().then((r) => setFeatured(r.events)).catch(() => {});

    api.events.list({ from: new Date().toISOString() }).then((r) => {
      const sorted = r.events.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
      setUpcoming(sorted.slice(0, 8));

      // Extract unique cities with counts
      const cityMap: Record<string, number> = {};
      r.events.forEach((ev) => {
        if (ev.city) cityMap[ev.city] = (cityMap[ev.city] || 0) + 1;
      });
      const cityList = Object.entries(cityMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      setCities(cityList);
    }).catch(() => {});

    if (user) api.events.favoriteIds().then((r) => setFavIds(new Set(r.ids))).catch(() => {});

    const { from, to } = getWeekendRange();
    api.events.list({ from, to }).then((r) => setWeekendEvents(r.events.slice(0, 6))).catch(() => {});
  }, []);

  function handleFavToggle(eventId: string, favorited: boolean) {
    setFavIds((prev) => {
      const next = new Set(prev);
      if (favorited) next.add(eventId); else next.delete(eventId);
      return next;
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <div>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <HeroSection featured={featured} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} navigate={navigate} />

      {/* ═══════════════════ COMMUNITIES ═══════════════════ */}
      <CommunityCarousel />

      {/* ═══════════════════ CATEGORIES ═══════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader title="Kategorien entdecken" subtitle="Finde Events nach deinem Geschmack" linkTo="/events" linkLabel="Alle Events" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.cat}
              to={`/events?category=${c.cat}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-accent-500/10"
            >
              <img src={c.img} alt={c.label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-base font-bold text-white">{c.label}</div>
                <div className="mt-0.5 text-xs text-white/60 group-hover:text-white/80 transition-colors">Entdecken →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FEATURED / HIGHLIGHTS ═══════════════════ */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader title="Highlights" subtitle="Handverlesene Events für dich" linkTo="/events" linkLabel="Alle Events" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((ev) => (
              <EventCard key={ev.id} ev={ev} isFavorited={favIds.has(ev.id)} onToggle={handleFavToggle} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ UPCOMING / BALD IN DEINER NÄHE ═══════════════════ */}
      {upcoming.length > 0 && (
        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeader title="Bald in deiner Nähe" subtitle="Die nächsten Veranstaltungen" linkTo="/events" linkLabel="Alle Events" />
            <div className="grid gap-3 sm:grid-cols-2">
              {upcoming.map((ev) => (
                <div key={ev.id} className="relative">
                  {/* Relative date badge */}
                  <div className="absolute -left-1 top-3 z-10 rounded-r-full bg-accent-500/90 px-3 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-accent-500/20">
                    {formatRelativeDate(ev.startsAt)}
                  </div>
                  <EventCard ev={ev} size="compact" isFavorited={favIds.has(ev.id)} onToggle={handleFavToggle} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ WEEKEND EVENTS ═══════════════════ */}
      {weekendEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            title="Dieses Wochenende"
            subtitle="Plane dein Wochenende mit diesen Events"
            linkTo="/events"
            linkLabel="Mehr Events"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {weekendEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} isFavorited={favIds.has(ev.id)} onToggle={handleFavToggle} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ CITIES / STÄDTE ═══════════════════ */}
      {cities.length > 0 && (
        <section className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeader title="Events nach Stadt" subtitle="Entdecke was in deiner Stadt los ist" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {cities.map((city) => (
                <Link
                  key={city.name}
                  to={`/events?city=${encodeURIComponent(city.name)}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-neon-purple/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="text-2xl">📍</div>
                    <div className="mt-2 text-sm font-semibold text-white">{city.name}</div>
                    <div className="mt-1 text-xs text-surface-500">
                      {city.count} {city.count === 1 ? "Event" : "Events"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="border-b border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px sm:grid-cols-4">
          {[
            { value: "100%", label: "Kostenlos", sub: "Keine versteckten Kosten" },
            { value: "6+", label: "Kategorien", sub: "Für jeden Geschmack" },
            { value: "24/7", label: "Verfügbar", sub: "Immer online" },
            { value: "0", label: "Tracking", sub: "Kein Browser-Storage" },
          ].map((s, i) => (
            <div key={s.label} className={`px-6 py-10 text-center ${i > 0 ? "border-l border-white/[0.06]" : ""}`}>
              <div className="text-3xl font-extrabold text-gradient">{s.value}</div>
              <div className="mt-1 text-sm font-semibold text-white">{s.label}</div>
              <div className="mt-0.5 text-xs text-surface-500">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Warum Local<span className="text-accent-400">Events</span>?
          </h2>
          <p className="mt-3 text-sm text-surface-500">
            Die einfachste Art, lokale Veranstaltungen zu entdecken und zu teilen.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🎤", title: "Kostenlos einstellen", desc: "Veranstalter können ihre Events ohne Gebühren und ohne Abo veröffentlichen.", color: "from-neon-green/10 to-transparent" },
            { icon: "🔍", title: "Einfach entdecken", desc: "Finde Events per Suche, Kategorie, Stadt oder Datum – ganz ohne Account.", color: "from-accent-500/10 to-transparent" },
            { icon: "🔒", title: "Sicher & privat", desc: "Alle Daten liegen sicher im Backend. Kein Local Storage, kein Tracking.", color: "from-neon-purple/10 to-transparent" },
            { icon: "🎫", title: "Ticket-Links", desc: "Verlinke direkt zu deiner Ticketseite – Eventbrite, Eventim oder eigene Website.", color: "from-neon-pink/10 to-transparent" },
            { icon: "📱", title: "Mobile First", desc: "Optimiert für Smartphones und Tablets – dein Event sieht überall gut aus.", color: "from-neon-cyan/10 to-transparent" },
            { icon: "📤", title: "Social Sharing", desc: "Teile Events per WhatsApp, Twitter, Facebook oder E-Mail mit einem Klick.", color: "from-accent-500/10 to-transparent" },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.color} blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100`} />
              <div className="relative">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <div className="text-base font-semibold text-white">{f.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-surface-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-600/20 via-surface-900 to-neon-purple/10" />
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-accent-500/20 blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-neon-purple/20 blur-[80px]" />

          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-white sm:text-4xl">
              Bereit, dein Event zu veröffentlichen?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-surface-400">
              Registriere dich kostenlos und stelle dein erstes Event in wenigen Minuten online. Keine Gebühren, kein Abo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-surface-900 shadow-xl transition-all hover:shadow-2xl hover:shadow-white/10"
              >
                Jetzt kostenlos starten
              </Link>
              <Link
                to="/events"
                className="rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/5"
              >
                Events durchstöbern
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
