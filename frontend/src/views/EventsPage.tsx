import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type EventListItem } from "../lib/api";
import { categoryLabel, formatDate } from "../lib/format";
import { FavoriteButton } from "../ui/FavoriteButton";
import { EventCardSkeletonGrid } from "../ui/EventCardSkeleton";
import { useAuth } from "../state/auth";

/* ═══════════════════ DATA ═══════════════════ */

const FLAG_CDN = "https://hatscripts.github.io/circle-flags/flags";

const COMMUNITIES = [
  { value: "turkish",     label: "Türkisch",      code: "tr", img: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "greek",       label: "Griechisch",    code: "gr", img: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "romanian",    label: "Rumänisch",     code: "ro", img: "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "arabic",      label: "Arabisch",      code: "sa", img: "https://images.pexels.com/photos/3214995/pexels-photo-3214995.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "polish",      label: "Polnisch",      code: "pl", img: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "italian",     label: "Italienisch",   code: "it", img: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "balkan",      label: "Balkan",        code: "rs", img: "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "latin",       label: "Lateinamerika", code: "br", img: "https://images.pexels.com/photos/2868242/pexels-photo-2868242.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "african",     label: "Afrikanisch",   code: "ng", img: "https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "persian",     label: "Persisch",      code: "ir", img: "https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "kurdish",     label: "Kurdisch",      code: "iq", img: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "russian",     label: "Russisch",      code: "ru", img: "https://images.pexels.com/photos/753339/pexels-photo-753339.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "spanish",     label: "Spanisch",      code: "es", img: "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "portuguese",  label: "Portugiesisch", code: "pt", img: "https://images.pexels.com/photos/1555881/pexels-photo-1555881.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "asian",       label: "Asiatisch",     code: "cn", img: "https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "international", label: "International", code: "eu", img: "https://images.pexels.com/photos/1098460/pexels-photo-1098460.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "ukrainian",   label: "Ukrainisch",    code: "ua", img: "https://images.pexels.com/photos/4388164/pexels-photo-4388164.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { value: "vietnamese",  label: "Vietnamesisch", code: "vn", img: "https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

const CATEGORIES: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: "", label: "Alle", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { value: "KONZERT", label: "Konzerte", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
  { value: "FESTIVAL", label: "Festivals", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { value: "PARTY", label: "Partys", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg> },
  { value: "THEATER", label: "Theater", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10s3-3 3-8"/><path d="M22 10s-3-3-3-8"/><path d="M10 2c0 4.4-3.6 8-8 8"/><path d="M14 2c0 4.4 3.6 8 8 8"/><path d="M2 10s2 2 2 5"/><path d="M22 10s-2 2-2 5"/><path d="M8 15h8"/><path d="M2 22v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1"/></svg> },
  { value: "COMEDY", label: "Comedy", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
  { value: "SPORT", label: "Sport", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M9 3.5A14.5 14.5 0 0 1 12 21"/><path d="M15 3.5A14.5 14.5 0 0 0 12 21"/><path d="M3.5 9A14.5 14.5 0 0 1 21 12"/><path d="M3.5 15A14.5 14.5 0 0 0 21 12"/></svg> },
  { value: "AUSSTELLUNG", label: "Ausstellungen", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg> },
  { value: "WORKSHOP", label: "Workshops", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { value: "SONSTIGES", label: "Sonstiges", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
];

const MAJOR_CITIES = [
  "Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart","Düsseldorf",
  "Leipzig","Dortmund","Essen","Bremen","Dresden","Hannover","Nürnberg",
  "Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster","Karlsruhe",
  "Mannheim","Augsburg","Wiesbaden","Aachen","Braunschweig","Kiel","Chemnitz",
  "Halle","Magdeburg","Freiburg","Erfurt","Rostock","Mainz","Kassel",
  "Saarbrücken","Potsdam","Heidelberg","Darmstadt","Regensburg","Ingolstadt",
  "Würzburg","Ulm","Heilbronn","Wolfsburg","Göttingen","Osnabrück","Oldenburg",
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

/* ═══════════════════ CITY DROPDOWN ═══════════════════ */

function CityDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = MAJOR_CITIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  function select(city: string) {
    onChange(city);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={ref} className="relative sm:w-48">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-left transition-all focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30 hover:bg-white/[0.05]"
      >
        <span className="flex items-center gap-2 truncate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-surface-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className={value ? "text-white" : "text-surface-500"}>{value || "Stadt"}</span>
        </span>
        <span className="flex items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); select(""); }}
              className="flex h-4 w-4 items-center justify-center rounded-full text-surface-400 hover:text-white"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-surface-500 transition-transform ${open ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-surface-900 shadow-2xl shadow-black/50">
          <div className="p-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                autoFocus
                type="text"
                placeholder="Stadt suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] py-2 pl-8 pr-3 text-xs text-white placeholder-surface-500 outline-none focus:border-accent-500/40 focus:ring-1 focus:ring-accent-500/20"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            <button
              onClick={() => select("")}
              className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-white/[0.05] ${!value ? "text-accent-400 font-medium" : "text-surface-400"}`}
            >
              Alle Städte
            </button>
            {filtered.map((city) => (
              <button
                key={city}
                onClick={() => select(city)}
                className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-white/[0.05] ${value === city ? "text-accent-400 font-medium" : "text-white"}`}
              >
                {city}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-surface-500">Keine Stadt gefunden</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
              <Link to={`/events/${slide.id}`} className="group/btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-accent-500/25 transition-all duration-300 hover:from-accent-400 hover:to-purple-500 hover:shadow-accent-500/40 hover:gap-3 hover:scale-[1.02]">
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
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent-400">Communities</p>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Deine Community</h2>
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

      <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
        {COMMUNITIES.map((c) => {
          const isActive = selected === c.value;
          return (
            <button
              key={c.value}
              onClick={() => onSelect(isActive ? "" : c.value)}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative">
                {/* Active ring */}
                <div className={`absolute -inset-[3px] rounded-full transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  style={{ background: "linear-gradient(135deg, #3366ff, #a855f7, #ec4899)" }} />
                {/* Default ring */}
                <div className={`absolute -inset-[3px] rounded-full ring-2 transition-opacity duration-300 ${isActive ? "ring-transparent opacity-0" : "ring-white/10 group-hover:opacity-0"}`} />
                {/* Image */}
                <div className="relative h-20 w-20 overflow-hidden rounded-full sm:h-24 sm:w-24">
                  <img
                    src={c.img}
                    alt={c.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${isActive ? "opacity-0" : "group-hover:opacity-0"}`} />
                </div>
                {/* Flag */}
                <div className="absolute -bottom-1 -right-1 h-7 w-7 overflow-hidden rounded-full ring-[2.5px] ring-[rgb(9,9,11)]">
                  <img src={`${FLAG_CDN}/${c.code}.svg`} alt="" className="h-full w-full object-cover" />
                </div>
                {/* Active checkmark */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 shadow-lg shadow-accent-500/40 ring-2 ring-[rgb(9,9,11)]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium transition-colors duration-200 sm:text-sm ${isActive ? "text-white" : "text-surface-400 group-hover:text-white"}`}>
                {c.label}
              </span>
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
        <CityDropdown value={city} onChange={(v) => { setCity(v); }} />
        <button
          onClick={load}
          className="rounded-xl bg-gradient-to-r from-accent-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:from-accent-400 hover:to-purple-500 hover:shadow-accent-500/40 hover:scale-[1.02]"
        >
          <span className="flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Suchen
          </span>
        </button>
      </div>

      {/* ═══ CATEGORY TABS ═══ */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((c) => {
          const active = category === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "border-accent-500 bg-accent-500/15 text-accent-300 shadow-sm shadow-accent-500/20"
                  : "border-white/[0.08] bg-white/[0.03] text-surface-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <span className={active ? "text-accent-400" : "text-surface-500"}>{c.icon}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* ═══ RESULTS ═══ */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <EventCardSkeletonGrid count={6} />
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
