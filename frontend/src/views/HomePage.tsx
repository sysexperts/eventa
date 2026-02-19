import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type EventListItem } from "../lib/api";
import { categoryLabel, formatDate } from "../lib/format";
import { FavoriteButton } from "../ui/FavoriteButton";
import { useAuth } from "../state/auth";
import { EventCardSkeletonGrid } from "../ui/EventCardSkeleton";

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
  const day = now.getDay(); // 0=Sun,1=Mon,...,6=Sat
  // Start: today (from now)
  const from = now.toISOString();
  // End: Sunday of current week (or next Sunday if today is Sunday)
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const sun = new Date(now);
  sun.setDate(now.getDate() + daysUntilSunday);
  sun.setHours(23, 59, 59, 999);
  return { from, to: sun.toISOString() };
}

function _getWeekendRangeOld(): { from: string; to: string } {
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

  // ── Inline Top-Events-in-Stadt state ──
  const [cityEvts, setCityEvts] = useState<EventListItem[]>([]);
  const [cityEvtsLoading, setCityEvtsLoading] = useState(false);
  const [heroCity, setHeroCity] = useState<string>(() => localStorage.getItem("eventa_city") || "");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [cityPickerInput, setCityPickerInput] = useState("");
  const [allHeroCities, setAllHeroCities] = useState<string[]>([]);
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const cityDragging = useRef(false);
  const cityDragStartX = useRef(0);
  const cityDragScrollLeft = useRef(0);

  useEffect(() => {
    api.events.list({ from: new Date().toISOString() }).then((r) => {
      const seen = new Set<string>();
      r.events.forEach((ev) => { if (ev.city) seen.add(ev.city); });
      const sorted = Array.from(seen).sort();
      setAllHeroCities(sorted);
      if (!localStorage.getItem("eventa_city") && sorted.length > 0) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const match = nearestCity(pos.coords.latitude, pos.coords.longitude, sorted);
              setHeroCity(match);
              localStorage.setItem("eventa_city", match);
            },
            () => {}, { timeout: 8000 }
          );
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!heroCity) return;
    setCityEvtsLoading(true);
    api.events.list({ city: heroCity, from: new Date().toISOString() })
      .then((r) => {
        const sorted = r.events.sort((a, b) => {
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
        });
        setCityEvts(sorted.slice(0, 8));
      })
      .catch(() => setCityEvts([]))
      .finally(() => setCityEvtsLoading(false));
  }, [heroCity]);

  function selectHeroCity(c: string) {
    setHeroCity(c);
    localStorage.setItem("eventa_city", c);
    setShowCityPicker(false);
    setCityPickerInput("");
  }

  function scrollCity(dir: "left" | "right") {
    cityScrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  const filteredCityPicker = cityPickerInput
    ? MAJOR_CITIES.map((c) => c.name).filter((c) => c.toLowerCase().includes(cityPickerInput.toLowerCase()))
    : MAJOR_CITIES.map((c) => c.name);

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
      <div className="absolute inset-0" style={{ zIndex: 2, background: "linear-gradient(to bottom, rgba(9,9,11,0.65) 0%, rgba(9,9,11,0.35) 30%, rgba(9,9,11,0.6) 55%, rgba(9,9,11,0.92) 75%, rgb(9,9,11) 90%)" }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" style={{ zIndex: 2 }} />
      {/* Extra bottom fade for seamless transition */}
      <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: "linear-gradient(to bottom, transparent, rgb(9,9,11))" }} />
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

        {/* ── Top Events in deiner Stadt (inline slider) ── */}
        {(heroCity || cityEvtsLoading) && (
          <div className="mx-auto mt-10 w-full max-w-5xl">
            {/* Header row */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-400">Trending</p>
                <span className="text-surface-600">/</span>
                <h2 className="text-sm font-bold text-white sm:text-base">
                  Top Events in{" "}
                  <button
                    onClick={() => setShowCityPicker(true)}
                    className="inline-flex items-center gap-1 text-white underline decoration-accent-500/50 decoration-2 underline-offset-4 hover:decoration-accent-400 transition-all"
                  >
                    {heroCity}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent-400 shrink-0"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </h2>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => scrollCity("left")} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/30 text-surface-400 hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button onClick={() => scrollCity("right")} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/30 text-surface-400 hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <Link to={`/events?city=${encodeURIComponent(heroCity)}`} className="hidden sm:flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/30 px-3 py-1.5 text-[11px] font-medium text-surface-400 hover:text-white transition-all backdrop-blur-sm">
                  Alle
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              </div>
            </div>

            {/* Slider */}
            {cityEvtsLoading ? (
              <div className="flex gap-4 overflow-hidden">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="shrink-0 w-36 sm:w-44">
                    <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-white/[0.07]" />
                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-white/[0.07]" />
                  </div>
                ))}
              </div>
            ) : cityEvts.length === 0 ? (
              <p className="text-sm text-surface-500">Keine Events in {heroCity} gefunden. <button onClick={() => setShowCityPicker(true)} className="text-accent-400 hover:text-accent-300">Andere Stadt wählen</button></p>
            ) : (
              <div
                ref={cityScrollRef}
                className="flex gap-4 overflow-x-auto pt-8 pb-3 scrollbar-none select-none"
                style={{ cursor: "grab" }}
                onMouseDown={(e) => { cityDragging.current = true; cityDragStartX.current = e.pageX - (cityScrollRef.current?.offsetLeft ?? 0); cityDragScrollLeft.current = cityScrollRef.current?.scrollLeft ?? 0; if (cityScrollRef.current) cityScrollRef.current.style.cursor = "grabbing"; }}
                onMouseLeave={() => { cityDragging.current = false; if (cityScrollRef.current) cityScrollRef.current.style.cursor = "grab"; }}
                onMouseUp={() => { cityDragging.current = false; if (cityScrollRef.current) cityScrollRef.current.style.cursor = "grab"; }}
                onMouseMove={(e) => { if (!cityDragging.current || !cityScrollRef.current) return; e.preventDefault(); const x = e.pageX - (cityScrollRef.current.offsetLeft ?? 0); cityScrollRef.current.scrollLeft = cityDragScrollLeft.current - (x - cityDragStartX.current) * 1.2; }}
              >
                {cityEvts.map((ev, i) => {
                  const rank = i + 1;
                  const rankColors = ["text-amber-400", "text-surface-300", "text-amber-600", "text-surface-400", "text-surface-500"];
                  const rankColor = rankColors[Math.min(rank - 1, rankColors.length - 1)];
                  return (
                    <Link
                      key={ev.id}
                      to={`/events/${ev.id}`}
                      className="group relative shrink-0 w-36 sm:w-44"
                      draggable={false}
                      onClick={(e) => { if (Math.abs((cityScrollRef.current?.scrollLeft ?? 0) - cityDragScrollLeft.current) > 5) e.preventDefault(); }}
                    >
                      <div className={`absolute -left-1 -top-7 z-10 font-black leading-none select-none ${rankColor}`}
                        style={{ fontSize: rank <= 3 ? "2.8rem" : "2.2rem", textShadow: "0 2px 16px rgba(0,0,0,0.9)", fontFamily: "Inter, sans-serif", WebkitTextStroke: rank <= 3 ? "1px rgba(0,0,0,0.3)" : undefined }}>
                        {rank}
                      </div>
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/[0.08]">
                        {ev.imageUrl ? (
                          <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-900/60 to-surface-900 text-4xl">
                            {CATEGORY_ICONS[ev.category] || "🎉"}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        {ev.price && <div className="absolute bottom-2 left-2 right-2"><span className="text-[11px] font-semibold text-accent-300">{ev.price}</span></div>}
                        {(ev.isFeatured || ev.isPromoted) && (
                          <div className="absolute top-2 right-2">
                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${ev.isPromoted ? "bg-amber-400/90 text-surface-950" : "bg-neon-green/90 text-surface-950"}`}>
                              {ev.isPromoted ? "Top" : "Featured"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 px-0.5">
                        <p className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-accent-300 transition-colors">{ev.title}</p>
                        <p className="mt-0.5 text-[10px] text-surface-500">{formatDate(ev.startsAt)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* City picker modal */}
        {showCityPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCityPicker(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-surface-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Stadt wählen</h3>
                <button onClick={() => setShowCityPicker(false)} className="flex h-7 w-7 items-center justify-center rounded-full text-surface-400 hover:bg-white/[0.08] hover:text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <button
                onClick={() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition((pos) => { const match = nearestCity(pos.coords.latitude, pos.coords.longitude, allHeroCities); selectHeroCity(match); }, () => {}, { timeout: 8000 }); } setShowCityPicker(false); }}
                className="mb-3 flex w-full items-center gap-2.5 rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-2.5 text-sm font-medium text-accent-300 hover:bg-accent-500/20 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
                Standort automatisch erkennen
              </button>
              <input
                autoFocus
                type="text"
                placeholder="Stadt suchen…"
                value={cityPickerInput}
                onChange={(e) => setCityPickerInput(e.target.value)}
                className="mb-3 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-surface-500 outline-none focus:border-accent-500/50"
              />
              <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
                {filteredCityPicker.length === 0 ? (
                  <p className="py-4 text-center text-sm text-surface-500">Keine Stadt gefunden</p>
                ) : (
                  filteredCityPicker.map((c) => (
                    <button key={c} onClick={() => selectHeroCity(c)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${c === heroCity ? "bg-accent-500/15 text-accent-300" : "text-surface-300 hover:bg-white/[0.05] hover:text-white"}`}>
                      {c}
                      {c === heroCity && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ icon, value, label, suffix = "", color }: { icon: React.ReactNode; value: number; label: string; suffix?: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(value, 1800, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 text-center transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.05]">
      <div className={`pointer-events-none absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${color}`} />
      <div className="relative">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-2xl ring-1 ring-white/[0.08]">
          {icon}
        </div>
        <div className="text-3xl font-extrabold tabular-nums text-white sm:text-4xl">
          {count.toLocaleString("de-DE")}{suffix}
        </div>
        <div className="mt-1.5 text-sm font-medium text-surface-400">{label}</div>
      </div>
    </div>
  );
}

function StatsSection() {
  const [stats, setStats] = useState<{ activeEvents: number; totalUsers: number; citiesCount: number } | null>(null);

  useEffect(() => {
    api.stats.getPublic().then((s) => setStats(s)).catch(() => {});
  }, []);

  if (!stats) return null;

  const items = [
    { value: stats.activeEvents, label: "Aktive Veranstaltungen", sublabel: "jetzt buchbar", gradient: "from-accent-400 to-accent-300" },
    { value: stats.totalUsers, label: "Registrierte Nutzer", sublabel: "aus der Community", gradient: "from-violet-400 to-purple-300" },
    { value: stats.citiesCount, label: "Städte", sublabel: "deutschlandweit", gradient: "from-cyan-400 to-teal-300" },
  ];

  return (
    <section className="relative">
      {/* Top & bottom hairlines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-500/[0.03] via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col divide-y divide-white/[0.06] sm:flex-row sm:divide-x sm:divide-y-0">
          {items.map((item) => (
            <div key={item.label} className="group flex flex-1 flex-col items-center justify-center gap-1 py-10 sm:py-14 transition-colors duration-300 hover:bg-white/[0.015]">
              <div className={`bg-gradient-to-r ${item.gradient} bg-clip-text text-5xl font-black tabular-nums text-transparent sm:text-6xl lg:text-7xl`}>
                <AnimatedNumber value={item.value} />
              </div>
              <div className="mt-2 text-base font-semibold text-white/90">{item.label}</div>
              <div className="flex items-center gap-1.5 text-xs text-surface-500">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-green" />
                </span>
                {item.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(value, 2000, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <span ref={ref}>{count.toLocaleString("de-DE")}</span>;
}

const FLAG_CDN = "https://hatscripts.github.io/circle-flags/flags";

const CULTURES = [
  // Ranked by migrant population size in Germany (Statistisches Bundesamt)
  { slug: "turkish",       name: "Türkisch",      flag: "tr", img: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "croatian",      name: "Kroatisch",      flag: "hr", img: "https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "polish",        name: "Polnisch",       flag: "pl", img: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "romanian",      name: "Rumänisch",      flag: "ro", img: "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "italian",       name: "Italienisch",    flag: "it", img: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "greek",         name: "Griechisch",     flag: "gr", img: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "bulgarian",     name: "Bulgarisch",     flag: "bg", img: "https://images.pexels.com/photos/4388164/pexels-photo-4388164.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "russian",       name: "Russisch",       flag: "ru", img: "https://images.pexels.com/photos/753339/pexels-photo-753339.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "arabic",        name: "Arabisch",       flag: "sa", img: "https://images.pexels.com/photos/3214995/pexels-photo-3214995.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "persian",       name: "Persisch",       flag: "ir", img: "https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "spanish",       name: "Spanisch",       flag: "es", img: "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "balkan",        name: "Balkan",         flag: "rs", img: "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "latin",         name: "Lateinamerika",  flag: "br", img: "https://images.pexels.com/photos/2868242/pexels-photo-2868242.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "african",       name: "Afrikanisch",    flag: "ng", img: "https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "kurdish",       name: "Kurdisch",       flag: "iq", img: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "international", name: "International",  flag: "eu", img: "https://images.pexels.com/photos/1098460/pexels-photo-1098460.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

function CommunityCarousel() {
  const fallback = CULTURES.map((c) => ({ slug: c.slug, name: c.name, flag: c.flag, flagUrl: "", img: c.img }));
  const [items, setItems] = useState(fallback);

  useEffect(() => {
    api.communities.list()
      .then((r) => {
        if (!r.communities?.length) return;
        // Show only communities flagged for homepage; fall back to hardcoded defaults for missing fields
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
        setItems(mapped);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-14">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent-400">Communities</p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Events aus aller Welt</h2>
          </div>
          <Link
            to="/events"
            className="hidden items-center gap-1.5 text-sm font-medium text-surface-400 transition hover:text-white sm:flex"
          >
            Alle anzeigen
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
      </div>

      {/* Community avatars */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
          {items.slice(0, 8).map((c) => (
            <Link
              key={c.slug}
              to={`/events?community=${c.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              {/* Circle */}
              <div className="relative">
                {/* Animated gradient ring on hover */}
                <div className="absolute -inset-[3px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "linear-gradient(135deg, #3366ff, #a855f7, #ec4899)" }} />
                {/* Default subtle ring */}
                <div className="absolute -inset-[3px] rounded-full ring-2 ring-white/10 transition-opacity duration-300 group-hover:opacity-0" />
                {/* Image */}
                <div className="relative h-20 w-20 overflow-hidden rounded-full sm:h-24 sm:w-24">
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
              <span className="text-xs font-medium text-surface-400 transition-colors duration-200 group-hover:text-white sm:text-sm">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategorySection() {
  const fallbackCats = CATEGORIES.map((c) => ({ slug: c.cat, name: c.label, cat: c.cat, img: c.img, icon: "" }));
  const [cats, setCats] = useState(fallbackCats);

  useEffect(() => {
    api.categories.list()
      .then((r) => {
        if (!r.categories?.length) return;
        const homepage = r.categories.filter((c: any) => c.showOnHomepage);
        if (!homepage.length) return;
        const fallbackMap = new Map(CATEGORIES.map((c) => [c.cat, c]));
        setCats(
          homepage.map((db: any) => {
            const fb = fallbackMap.get(db.eventCategory || db.slug);
            return {
              slug: db.slug,
              name: db.name || fb?.label || db.slug,
              cat: db.eventCategory || db.slug,
              img: db.imageUrl || fb?.img || "",
              icon: db.icon || "",
            };
          })
        );
      })
      .catch(() => {});
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader title="Kategorien entdecken" subtitle="Finde Events nach deinem Geschmack" linkTo="/events" linkLabel="Alle Events" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cats.map((c) => (
          <Link
            key={c.slug}
            to={`/events?category=${c.cat}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-accent-500/10"
          >
            {c.img && <img src={c.img} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              {c.icon && <span className="text-2xl mb-1 block">{c.icon}</span>}
              <div className="text-base font-bold text-white">{c.name}</div>
              <div className="mt-0.5 text-xs text-white/60 group-hover:text-white/80 transition-colors">Entdecken →</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════ TOP EVENTS IN DEINER STADT ═══════════════════ */

const MAJOR_CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Berlin",       lat: 52.5200, lng: 13.4050 },
  { name: "Hamburg",      lat: 53.5511, lng:  9.9937 },
  { name: "München",      lat: 48.1351, lng: 11.5820 },
  { name: "Köln",         lat: 50.9333, lng:  6.9500 },
  { name: "Frankfurt",    lat: 50.1109, lng:  8.6821 },
  { name: "Stuttgart",    lat: 48.7758, lng:  9.1829 },
  { name: "Düsseldorf",   lat: 51.2217, lng:  6.7762 },
  { name: "Leipzig",      lat: 51.3397, lng: 12.3731 },
  { name: "Dortmund",     lat: 51.5136, lng:  7.4653 },
  { name: "Essen",        lat: 51.4556, lng:  7.0116 },
  { name: "Bremen",       lat: 53.0793, lng:  8.8017 },
  { name: "Dresden",      lat: 51.0504, lng: 13.7373 },
  { name: "Hannover",     lat: 52.3759, lng:  9.7320 },
  { name: "Nürnberg",     lat: 49.4521, lng: 11.0767 },
  { name: "Duisburg",     lat: 51.4344, lng:  6.7623 },
  { name: "Bochum",       lat: 51.4818, lng:  7.2162 },
  { name: "Wuppertal",    lat: 51.2562, lng:  7.1508 },
  { name: "Bielefeld",    lat: 52.0302, lng:  8.5325 },
  { name: "Bonn",         lat: 50.7374, lng:  7.0982 },
  { name: "Münster",      lat: 51.9607, lng:  7.6261 },
  { name: "Karlsruhe",    lat: 49.0069, lng:  8.4037 },
  { name: "Mannheim",     lat: 49.4875, lng:  8.4660 },
  { name: "Augsburg",     lat: 48.3705, lng: 10.8978 },
  { name: "Wiesbaden",    lat: 50.0782, lng:  8.2398 },
  { name: "Aachen",       lat: 50.7753, lng:  6.0839 },
  { name: "Braunschweig", lat: 52.2689, lng: 10.5268 },
  { name: "Kiel",         lat: 54.3233, lng: 10.1394 },
  { name: "Chemnitz",     lat: 50.8278, lng: 12.9214 },
  { name: "Halle",        lat: 51.4825, lng: 11.9706 },
  { name: "Magdeburg",    lat: 52.1205, lng: 11.6276 },
  { name: "Freiburg",     lat: 47.9990, lng:  7.8421 },
  { name: "Erfurt",       lat: 50.9848, lng: 11.0299 },
  { name: "Rostock",      lat: 54.0924, lng: 12.0991 },
  { name: "Mainz",        lat: 49.9929, lng:  8.2473 },
  { name: "Kassel",       lat: 51.3127, lng:  9.4797 },
  { name: "Saarbrücken",  lat: 49.2354, lng:  6.9969 },
  { name: "Potsdam",      lat: 52.3906, lng: 13.0645 },
  { name: "Heidelberg",   lat: 49.3988, lng:  8.6724 },
  { name: "Darmstadt",    lat: 49.8728, lng:  8.6512 },
  { name: "Regensburg",   lat: 49.0134, lng: 12.1016 },
  { name: "Ingolstadt",   lat: 48.7665, lng: 11.4257 },
  { name: "Würzburg",     lat: 49.7913, lng:  9.9534 },
  { name: "Ulm",          lat: 48.3984, lng:  9.9916 },
  { name: "Heilbronn",    lat: 49.1427, lng:  9.2109 },
  { name: "Wolfsburg",    lat: 52.4227, lng: 10.7865 },
  { name: "Göttingen",    lat: 51.5413, lng:  9.9158 },
  { name: "Osnabrück",    lat: 52.2799, lng:  8.0472 },
  { name: "Oldenburg",    lat: 53.1435, lng:  8.2146 },
];

function nearestCity(lat: number, lng: number, available: string[]): string {
  function dist(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const dx = a.lat - b.lat;
    const dy = a.lng - b.lng;
    return Math.sqrt(dx * dx + dy * dy);
  }
  // Prefer cities that actually have events in the DB
  const candidates = available.length > 0
    ? MAJOR_CITIES.filter((c) => available.some((a) => a.toLowerCase() === c.name.toLowerCase()))
    : MAJOR_CITIES;
  const pool = candidates.length > 0 ? candidates : MAJOR_CITIES;
  let best = pool[0];
  let bestDist = dist({ lat, lng }, best);
  for (const city of pool) {
    const d = dist({ lat, lng }, city);
    if (d < bestDist) { bestDist = d; best = city; }
  }
  return best.name;
}

function TopEventsSection() {
  const [city, setCity] = useState<string>(() => localStorage.getItem("eventa_city") || "");
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerInput, setPickerInput] = useState("");
  const [allCities, setAllCities] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    dragStartX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    dragScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  }
  function onMouseLeave() {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }
  function onMouseUp() {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft ?? 0);
    const walk = (x - dragStartX.current) * 1.2;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  }

  // Load all available cities from events
  useEffect(() => {
    api.events.list({ from: new Date().toISOString() }).then((r) => {
      const seen = new Set<string>();
      r.events.forEach((ev) => { if (ev.city) seen.add(ev.city); });
      const sorted = Array.from(seen).sort();
      setAllCities(sorted);
      // Auto-detect city if none saved
      if (!localStorage.getItem("eventa_city") && sorted.length > 0) {
        detectCity(sorted);
      }
    }).catch(() => {});
  }, []);

  // Load events when city changes
  useEffect(() => {
    if (!city) return;
    setLoading(true);
    api.events.list({ city, from: new Date().toISOString() })
      .then((r) => {
        // Sort: promoted first, then featured, then by startsAt
        const sorted = r.events.sort((a, b) => {
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
        });
        setEvents(sorted.slice(0, 8));
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [city]);

  function detectCity(available: string[]) {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const match = nearestCity(latitude, longitude, available);
        setCity(match);
        localStorage.setItem("eventa_city", match);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  }

  function selectCity(c: string) {
    setCity(c);
    localStorage.setItem("eventa_city", c);
    setShowPicker(false);
    setPickerInput("");
  }

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  const pickerCities = MAJOR_CITIES.map((c) => c.name);
  const filtered = pickerInput
    ? pickerCities.filter((c) => c.toLowerCase().includes(pickerInput.toLowerCase()))
    : pickerCities;

  if (!city && !geoLoading) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-400">Trending</p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Top Events in{" "}
              <button
                onClick={() => setShowPicker(true)}
                className="inline-flex items-center gap-1.5 text-white underline decoration-accent-500/50 decoration-2 underline-offset-4 hover:decoration-accent-400 transition-all"
              >
                {geoLoading ? (
                  <span className="inline-block h-5 w-24 animate-pulse rounded bg-white/10" />
                ) : (
                  city
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent-400 shrink-0"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => scroll("left")} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-surface-400 hover:bg-white/[0.08] hover:text-white transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => scroll("right")} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-surface-400 hover:bg-white/[0.08] hover:text-white transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <Link to={`/events?city=${encodeURIComponent(city)}`} className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-surface-400 hover:bg-white/[0.08] hover:text-white transition-all">
            Alle anzeigen
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
      </div>

      {/* City picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-surface-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Stadt wählen</h3>
              <button onClick={() => setShowPicker(false)} className="flex h-7 w-7 items-center justify-center rounded-full text-surface-400 hover:bg-white/[0.08] hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <button
              onClick={() => { setGeoLoading(true); detectCity(allCities); setShowPicker(false); }}
              className="mb-3 flex w-full items-center gap-2.5 rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-2.5 text-sm font-medium text-accent-300 hover:bg-accent-500/20 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              Standort automatisch erkennen
            </button>
            <input
              autoFocus
              type="text"
              placeholder="Stadt suchen…"
              value={pickerInput}
              onChange={(e) => setPickerInput(e.target.value)}
              className="mb-3 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-surface-500 outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
            />
            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
              {filtered.length === 0 ? (
                <p className="py-4 text-center text-sm text-surface-500">Keine Stadt gefunden</p>
              ) : (
                filtered.map((c) => (
                  <button key={c} onClick={() => selectCity(c)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${c === city ? "bg-accent-500/15 text-accent-300" : "text-surface-300 hover:bg-white/[0.05] hover:text-white"}`}>
                    {c}
                    {c === city && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ranked cards */}
      {loading || geoLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="shrink-0 w-52 sm:w-60">
              <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-white/[0.05]" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-white/[0.05]" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-14 text-center">
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-sm font-medium text-surface-300">Keine Events in {city} gefunden</p>
          <button onClick={() => setShowPicker(true)} className="mt-3 text-sm text-accent-400 hover:text-accent-300 transition-colors">Andere Stadt wählen</button>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pt-10 pb-4 scrollbar-none select-none"
          style={{ cursor: "grab" }}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {events.map((ev, i) => {
            const rank = i + 1;
            const rankColors = ["text-amber-400", "text-surface-300", "text-amber-600", "text-surface-400", "text-surface-500"];
            const rankColor = rankColors[Math.min(rank - 1, rankColors.length - 1)];
            return (
              <Link
                key={ev.id}
                to={`/events/${ev.id}`}
                className="group relative shrink-0 w-44 sm:w-52"
                draggable={false}
                onClick={(e) => { if (Math.abs((scrollRef.current?.scrollLeft ?? 0) - dragScrollLeft.current) > 5) e.preventDefault(); }}
              >
                {/* Rank number */}
                <div className={`absolute -left-1 -top-8 z-10 font-black leading-none select-none ${rankColor}`}
                  style={{ fontSize: rank <= 3 ? "3.2rem" : "2.5rem", textShadow: "0 2px 16px rgba(0,0,0,0.9)", fontFamily: "Inter, sans-serif", WebkitTextStroke: rank <= 3 ? "1px rgba(0,0,0,0.3)" : undefined }}>
                  {rank}
                </div>
                {/* Card image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/[0.06]">
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-900/60 to-surface-900 text-5xl">
                      {CATEGORY_ICONS[ev.category] || "🎉"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {ev.price && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-xs font-semibold text-accent-300">{ev.price}</span>
                    </div>
                  )}
                  {(ev.isFeatured || ev.isPromoted) && (
                    <div className="absolute top-2 right-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${ev.isPromoted ? "bg-amber-400/90 text-surface-950" : "bg-neon-green/90 text-surface-950"}`}>
                        {ev.isPromoted ? "Top" : "Featured"}
                      </span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="mt-2.5 px-0.5">
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-accent-300 transition-colors">{ev.title}</p>
                  <p className="mt-1 text-xs text-surface-500">{formatDate(ev.startsAt)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════ EVENTS DIESE WOCHE IN DEINER STADT ═══════════════════ */

function WeekEventsSection({ favIds, onToggle }: { favIds: Set<string>; onToggle: (id: string, fav: boolean) => void }) {
  const [city, setCity] = useState<string>(() => localStorage.getItem("eventa_city") || "");
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function syncCity() {
      const stored = localStorage.getItem("eventa_city") || "";
      setCity(stored);
    }
    window.addEventListener("storage", syncCity);
    // Also poll every 2s in case TopEventsSection sets it in same tab
    const interval = setInterval(syncCity, 2000);
    return () => { window.removeEventListener("storage", syncCity); clearInterval(interval); };
  }, []);

  useEffect(() => {
    setLoading(true);
    api.events.list({ from: new Date().toISOString(), ...(city ? { city } : {}) })
      .then((r) => setEvents(r.events.slice(0, 6)))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [city]);

  if (!loading && events.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        title={`Nächste Events${city ? ` in ${city}` : ""}`}
        subtitle="Die nächsten Veranstaltungen in deiner Nähe"
        linkTo={`/events${city ? `?city=${encodeURIComponent(city)}` : ""}`}
        linkLabel="Alle Events"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <EventCardSkeletonGrid count={6} />
        ) : (
          events.map((ev) => (
            <EventCard key={ev.id} ev={ev} isFavorited={favIds.has(ev.id)} onToggle={onToggle} />
          ))
        )}
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
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  useEffect(() => {
    api.events.featured().then((r) => setFeatured(r.events)).catch(() => {}).finally(() => setLoadingFeatured(false));

    api.events.list({ from: new Date().toISOString() }).then((r) => {
      const sorted = r.events.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
      setUpcoming(sorted.slice(0, 8));
      setLoadingUpcoming(false);

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
    const savedCity = localStorage.getItem("eventa_city") || undefined;
    api.events.list({ from, to, ...(savedCity ? { city: savedCity } : {}) }).then((r) => setWeekendEvents(r.events.slice(0, 6))).catch(() => {});
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

      {/* ═══════════════════ FEATURED / HIGHLIGHTS ═══════════════════ */}
      {(loadingFeatured || featured.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader title="Highlights" subtitle="Handverlesene Events für dich" linkTo="/events" linkLabel="Alle Events" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loadingFeatured ? (
              <EventCardSkeletonGrid count={6} />
            ) : (
              featured.map((ev) => (
                <EventCard key={ev.id} ev={ev} isFavorited={favIds.has(ev.id)} onToggle={handleFavToggle} />
              ))
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════ CATEGORIES ═══════════════════ */}
      <CategorySection />

      {/* ═══════════════════ EVENTS DIESE WOCHE ═══════════════════ */}
      <WeekEventsSection favIds={favIds} onToggle={handleFavToggle} />

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-600/20 via-surface-900 to-neon-purple/10" />
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-accent-500/20 blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-neon-purple/20 blur-[80px]" />
          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className="text-2xl font-bold text-white sm:text-4xl">Bereit, dein Event zu veröffentlichen?</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-surface-400">Registriere dich kostenlos und stelle dein erstes Event in wenigen Minuten online. Keine Gebühren, kein Abo.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-surface-900 shadow-xl transition-all hover:shadow-2xl hover:shadow-white/10">Jetzt kostenlos starten</Link>
              <Link to="/events" className="rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/5">Events durchstöbern</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

