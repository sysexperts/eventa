import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type EventListItem } from "../lib/api";
import { categoryLabel, formatDate } from "../lib/format";
import { FavoriteButton } from "../ui/FavoriteButton";
import { useAuth } from "../state/auth";

/* ═══════════════════ DATA ═══════════════════ */

const FLAG_CDN = "https://hatscripts.github.io/circle-flags/flags";

const COMMUNITIES = [
  { value: "turkish", label: "Türkisch", code: "tr", img: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80" },
  { value: "greek", label: "Griechisch", code: "gr", img: "https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=600&q=80" },
  { value: "romanian", label: "Rumänisch", code: "ro", img: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=600&q=80" },
  { value: "arabic", label: "Arabisch", code: "sa", img: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=600&q=80" },
  { value: "polish", label: "Polnisch", code: "pl", img: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=600&q=80" },
  { value: "italian", label: "Italienisch", code: "it", img: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=600&q=80" },
  { value: "balkan", label: "Balkan", code: "rs", img: "https://images.unsplash.com/photo-1555990538-1e15a2d6b7a3?auto=format&fit=crop&w=600&q=80" },
  { value: "latin", label: "Lateinamerika", code: "br", img: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=600&q=80" },
  { value: "african", label: "Afrikanisch", code: "ng", img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80" },
  { value: "persian", label: "Persisch", code: "ir", img: "https://images.unsplash.com/photo-1565711561500-49678a10a63f?auto=format&fit=crop&w=600&q=80" },
  { value: "kurdish", label: "Kurdisch", code: "iq", img: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=600&q=80" },
  { value: "russian", label: "Russisch", code: "ru", img: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=600&q=80" },
  { value: "spanish", label: "Spanisch", code: "es", img: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80" },
  { value: "portuguese", label: "Portugiesisch", code: "pt", img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=600&q=80" },
  { value: "asian", label: "Asiatisch", code: "cn", img: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=600&q=80" },
  { value: "international", label: "International", code: "eu", img: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80" },
];

const CATEGORIES = [
  { value: "", label: "Alle", icon: "🔥" },
  { value: "KONZERT", label: "Konzerte", icon: "🎵" },
  { value: "FESTIVAL", label: "Festivals", icon: "🎪" },
  { value: "THEATER", label: "Theater", icon: "🎭" },
  { value: "COMEDY", label: "Comedy", icon: "😂" },
  { value: "PARTY", label: "Partys", icon: "🎉" },
  { value: "SPORT", label: "Sport", icon: "⚽" },
  { value: "WORKSHOP", label: "Workshops", icon: "📚" },
  { value: "AUSSTELLUNG", label: "Ausstellungen", icon: "🎨" },
  { value: "SONSTIGES", label: "Sonstiges", icon: "✨" },
];

const CATEGORY_ICONS: Record<string, string> = {
  KONZERT: "🎵", FESTIVAL: "🎪", MUSICAL: "🎶", OPER: "🎼", KABARETT: "🎤", OPEN_MIC: "🎙️", DJ_EVENT: "🎧",
  THEATER: "🎭", COMEDY: "😂", TANZ: "💃", ZAUBERSHOW: "🪄",
  AUSSTELLUNG: "🎨", LESUNG: "📖", FILM: "🎬", FOTOGRAFIE: "📷", MUSEUM: "🏛️",
  FLOHMARKT: "🛍️", WOCHENMARKT: "🥕", WEIHNACHTSMARKT: "🎄", MESSE: "🏢", FOOD_FESTIVAL: "🍔",
  SPORT: "⚽", LAUF: "🏃", TURNIER: "🏆", YOGA: "🧘", WANDERUNG: "🥾",
  KINDERTHEATER: "🧸", FAMILIENTAG: "👨‍👩‍👧‍👦", KINDER_WORKSHOP: "✂️",
  WEINPROBE: "🍷", CRAFT_BEER: "🍺", KOCHKURS: "👨‍🍳", FOOD_TRUCK: "🚚", KULINARISCHE_TOUR: "🍽️",
  WORKSHOP: "📚", SEMINAR: "🎓", KONFERENZ: "💼", NETWORKING: "🤝", VORTRAG: "🗣️",
  CLUBNACHT: "🌙", KARAOKE: "🎤", PARTY: "🎉",
  KARNEVAL: "🎭", OKTOBERFEST: "🍻", SILVESTER: "🎆", STADTFEST: "🏘️", STRASSENFEST: "🎊",
  SONSTIGES: "✨",
};

/* ═══════════════════ VIDEO HELPERS ═══════════════════ */

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)([?#]|$)/i.test(url) || url.includes("/video/");
}

/* ═══════════════════ HERO SLIDER ═══════════════════ */

const SLIDE_DURATION = 7000;

function HeroSlider({ slides }: { slides: EventListItem[] }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = slides.length;

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
    if (videoFallbackRef.current) { clearTimeout(videoFallbackRef.current); videoFallbackRef.current = null; }
  }, []);

  const goNext = useCallback(() => {
    setCurrent((prev: number) => (prev + 1) % count);
  }, [count]);

  const startImageTimers = useCallback(() => {
    clearTimers();
    setProgress(0);
    let prog = 0;
    progressRef.current = setInterval(() => {
      prog += 50;
      setProgress(Math.min((prog / SLIDE_DURATION) * 100, 100));
    }, 50);
    if (count > 1) {
      timerRef.current = setInterval(() => {
        goNext();
        prog = 0;
        setProgress(0);
      }, SLIDE_DURATION);
    }
  }, [count, clearTimers, goNext]);

  // Determine if current slide has a video
  const slide = slides[current];
  const heroVideo = slide?.heroVideoUrl && isVideoUrl(slide.heroVideoUrl) ? slide.heroVideoUrl : null;
  const showVideo = videoEnabled && !!heroVideo;

  // Handle slide changes: start timers or wait for video
  useEffect(() => {
    if (!showVideo) {
      setVideoPlaying(false);
      startImageTimers();
    } else {
      // Video slide: pause auto-advance, use fallback timer (60s max)
      clearTimers();
      setProgress(0);
      setVideoPlaying(true);
      if (count > 1) {
        videoFallbackRef.current = setTimeout(() => { goNext(); }, 60000);
      }
    }
    return clearTimers;
  }, [current, showVideo, startImageTimers, clearTimers, count, goNext]);

  function nav(idx: number) {
    setCurrent(((idx % count) + count) % count);
  }

  function toggleVideo() {
    setVideoEnabled((prev) => !prev);
  }

  if (count === 0) return null;

  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl shadow-2xl shadow-black/40">
      <div className="relative aspect-[16/7] sm:aspect-[2.5/1] lg:aspect-[3/1] w-full">
        {/* Background layers */}
        {slides.map((s, i) => (
          <div key={s.id} className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
            {s.imageUrl ? (
              <img src={s.imageUrl} alt={s.title} className="h-full w-full object-cover" style={{ transform: i === current ? "scale(1.03)" : "scale(1)", transition: "transform 8s ease-out" }} />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-accent-600 via-purple-800 to-surface-900" />
            )}
          </div>
        ))}

        {/* Video overlay */}
        {showVideo && heroVideo && (
          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            <video
              key={`vid-${current}`}
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-surface-950/95 via-surface-950/40 to-surface-950/10" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />

        {/* Video toggle button (top right) */}
        {heroVideo && (
          <button
            onClick={toggleVideo}
            className="absolute top-4 right-4 z-[6] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white hover:scale-110"
            title={videoEnabled ? "Video deaktivieren" : "Video aktivieren"}
          >
            {videoEnabled ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
          </button>
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 z-[4] flex flex-col justify-end p-5 sm:justify-center sm:p-10 lg:p-16">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {slide.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neon-green/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-950 shadow-lg shadow-neon-green/20">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Featured
                </span>
              )}
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">{categoryLabel(slide.category)}</span>
              {showVideo && videoPlaying && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  Live Video
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight">{slide.title}</h2>
            <p className="mt-3 text-sm text-white/60 line-clamp-2 sm:text-base lg:text-lg max-w-lg leading-relaxed">{slide.shortDescription}</p>
            <div className="mt-5 inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3 backdrop-blur-xl">
              <span className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {formatDate(slide.startsAt)}
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-400"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {slide.city}
              </span>
              {slide.price && (<><span className="h-4 w-px bg-white/20" /><span className="text-xs sm:text-sm font-bold text-accent-300">{slide.price}</span></>)}
            </div>
            <div className="mt-5">
              <Link to={`/events/${slide.id}`} className="group/btn inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-accent-500/25 transition-all duration-300 hover:bg-accent-400 hover:shadow-accent-500/40 hover:gap-3">
                Event ansehen
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-0.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {count > 1 && (
          <>
            <button onClick={() => nav(current - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-[5] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white hover:scale-110">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => nav(current + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-[5] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white hover:scale-110" style={{ top: heroVideo ? "calc(50% + 24px)" : "50%" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </>
        )}

        {/* Progress bar + dots */}
        {count > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-[5]">
            {!showVideo && (
              <div className="h-[3px] w-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-accent-400 to-accent-500 transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />
              </div>
            )}
            <div className="flex justify-center gap-2 py-3">
              {slides.map((s, i) => {
                const hasVid = s.heroVideoUrl && isVideoUrl(s.heroVideoUrl);
                return (
                  <button
                    key={i}
                    onClick={() => nav(i)}
                    className={`rounded-full transition-all duration-500 ${
                      i === current
                        ? `h-2.5 w-8 shadow-md ${hasVid && videoEnabled ? "bg-red-400 shadow-red-400/30" : "bg-accent-400 shadow-accent-400/30"}`
                        : `h-2.5 w-2.5 ${hasVid ? "bg-red-400/40 hover:bg-red-400/70" : "bg-white/25 hover:bg-white/50"}`
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ COMMUNITY SELECTOR ═══════════════════ */

function CommunitySelector({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <section className="mb-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Deine Community</h2>
          <p className="mt-1 text-sm text-surface-400">Finde Events deiner Kultur</p>
        </div>
        {selected && (
          <button
            onClick={() => onSelect("")}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-surface-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            Alle anzeigen
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
        {COMMUNITIES.map((c) => {
          const isActive = selected === c.value;
          return (
            <button
              key={c.value}
              onClick={() => onSelect(isActive ? "" : c.value)}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isActive
                  ? "border-accent-400/60 shadow-lg shadow-accent-500/20 scale-[1.03] ring-2 ring-accent-500/30"
                  : "border-white/[0.06] hover:border-white/[0.15] hover:scale-[1.03] hover:shadow-lg hover:shadow-black/20"
              }`}
            >
              {/* Background image */}
              <div className="relative aspect-[3/4] w-full">
                <img
                  src={c.img}
                  alt={c.label}
                  className={`h-full w-full object-cover transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                />
                {/* Dark gradient overlay */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  isActive
                    ? "bg-gradient-to-t from-black/80 via-black/40 to-black/20"
                    : "bg-gradient-to-t from-black/90 via-black/50 to-black/30 group-hover:from-black/70 group-hover:via-black/30 group-hover:to-black/10"
                }`} />

                {/* Flag + Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-3 pb-4">
                  <img
                    src={`${FLAG_CDN}/${c.code}.svg`}
                    alt={c.label}
                    className={`h-8 w-8 sm:h-10 sm:w-10 mb-1.5 rounded-full shadow-lg shadow-black/30 ring-2 ring-white/20 transition-transform duration-300 ${isActive ? "scale-110 ring-accent-400/50" : "group-hover:scale-110"}`}
                  />
                  <span className={`text-xs font-bold text-center leading-tight drop-shadow-md transition-colors ${isActive ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                    {c.label}
                  </span>
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 shadow-lg shadow-accent-500/40">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════ EVENT CARD ═══════════════════ */

function EventCard({ ev, isFavorited, onToggle }: { ev: EventListItem; isFavorited: boolean; onToggle: (id: string, fav: boolean) => void }) {
  const isPast = new Date(ev.startsAt) < new Date();

  return (
    <Link
      to={`/events/${ev.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-accent-500/5 ${isPast ? "opacity-60 grayscale" : ""}`}
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
          {isPast && (
            <span className="rounded-full bg-surface-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Abgelaufen</span>
          )}
          {ev.isFeatured && !isPast && (
            <span className="rounded-full bg-neon-green/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-surface-950">Featured</span>
          )}
          {ev.isPromoted && !isPast && (
            <span className="rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-surface-950">Promoted</span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {ev.price && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">{ev.price}</span>
          )}
          <FavoriteButton eventId={ev.id} isFavorited={isFavorited} onToggle={onToggle} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 text-[11px] font-medium text-white/70">
            <span className="rounded-full bg-white/10 px-2 py-0.5 backdrop-blur-sm">{categoryLabel(ev.category)}</span>
            <span>{formatDate(ev.startsAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-snug text-white group-hover:text-accent-300 transition-colors">{ev.title}</h3>
        <p className="mt-1.5 text-sm text-surface-400 line-clamp-2">{ev.shortDescription}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {ev.city}
          </div>
          {ev.community && (() => {
            const comm = COMMUNITIES.find((x) => x.value === ev.community);
            return comm ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-surface-400">
                <img src={`${FLAG_CDN}/${comm.code}.svg`} alt={comm.label} className="h-3.5 w-3.5 rounded-full" />
                {comm.label}
              </span>
            ) : null;
          })()}
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */

export function EventsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [featured, setFeatured] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [community, setCommunity] = useState(searchParams.get("community") || "");
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    try {
      const res = await api.events.list({ category, city, q: q || undefined, community: community || undefined });
      setEvents(res.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.events.featured().then((r) => setFeatured(r.events)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) api.events.favoriteIds().then((r) => setFavIds(new Set(r.ids))).catch(() => {});
  }, [user]);

  function handleFavToggle(eventId: string, favorited: boolean) {
    setFavIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (favorited) next.add(eventId); else next.delete(eventId);
      return next;
    });
  }

  useEffect(() => { load(); }, [category, city, community]);

  // Hero slides: if community is selected, filter featured by community; otherwise show all featured
  const heroSlides = community
    ? featured.filter((e) => e.imageUrl && e.community === community).slice(0, 8)
    : featured.filter((e) => e.imageUrl).slice(0, 8);
  // Fallback to first events with images if no featured
  const slidesToShow = heroSlides.length > 0 ? heroSlides : events.filter((e) => e.imageUrl).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ═══ COMMUNITY SELECTOR ═══ */}
      <CommunitySelector selected={community} onSelect={setCommunity} />

      {/* ═══ HERO SLIDER ═══ */}
      {slidesToShow.length > 0 && <HeroSlider slides={slidesToShow} />}

      {/* ═══ SEARCH + FILTERS ═══ */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Events suchen..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-accent-500/30"
          />
        </div>
        <div className="sm:w-44">
          <input
            type="text"
            placeholder="Stadt"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-accent-500/30"
          />
        </div>
        <button
          onClick={load}
          className="rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400 hover:shadow-accent-500/40"
        >
          <span className="flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Suchen
          </span>
        </button>
      </div>

      {/* ═══ CATEGORY TABS ═══ */}
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
      </div>

      {/* ═══ RESULTS ═══ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-700 border-t-accent-500" />
          <p className="mt-4 text-sm text-surface-500">Events werden geladen...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            {community ? (
              <img src={`${FLAG_CDN}/${COMMUNITIES.find((c) => c.value === community)?.code || "eu"}.svg`} alt="" className="h-10 w-10 rounded-full" />
            ) : (
              <span className="text-3xl">🔍</span>
            )}
          </div>
          <p className="mt-4 text-base font-medium text-surface-300">
            {community ? `Keine Events für die ${COMMUNITIES.find((c) => c.value === community)?.label}e Community gefunden` : "Keine Events gefunden"}
          </p>
          <p className="mt-1 text-sm text-surface-500">Versuche andere Suchkriterien oder eine andere Community.</p>
          <button
            onClick={() => { setCategory(""); setQ(""); setCity(""); setCommunity(""); }}
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
              {community && (
                <span className="ml-2">
                  in <span className="font-medium text-accent-300">{COMMUNITIES.find((c) => c.value === community)?.label}</span>
                </span>
              )}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <EventCard key={ev.id} ev={ev} isFavorited={favIds.has(ev.id)} onToggle={handleFavToggle} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
