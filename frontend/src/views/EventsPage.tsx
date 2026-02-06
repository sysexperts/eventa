import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type EventListItem } from "../lib/api";
import { categoryLabel, formatDate } from "../lib/format";
import { Input, Button } from "../ui/components";
import { FavoriteButton } from "../ui/FavoriteButton";
import { useAuth } from "../state/auth";

const CATEGORIES = [
  { value: "", label: "Alle", icon: "🔥" },
  { value: "KONZERT", label: "Konzerte", icon: "🎵" },
  { value: "FESTIVAL", label: "Festivals", icon: "🎪" },
  { value: "THEATER", label: "Theater", icon: "🎭" },
  { value: "COMEDY", label: "Comedy", icon: "😂" },
  { value: "FLOHMARKT", label: "Flohmärkte", icon: "🛍️" },
  { value: "SPORT", label: "Sport", icon: "⚽" },
  { value: "PARTY", label: "Partys", icon: "🎉" },
  { value: "WORKSHOP", label: "Workshops", icon: "📚" },
  { value: "AUSSTELLUNG", label: "Ausstellungen", icon: "🎨" },
  { value: "KINDERTHEATER", label: "Kinder", icon: "👨‍👩‍👧‍�" },
  { value: "WEINPROBE", label: "Essen & Trinken", icon: "🍷" },
  { value: "LESUNG", label: "Lesungen", icon: "�" },
  { value: "SONSTIGES", label: "Sonstiges", icon: "✨" },
];

const COMMUNITIES = [
  { value: "", label: "Alle Communities", flag: "🌍" },
  { value: "turkish", label: "Türkisch", flag: "🇹🇷" },
  { value: "greek", label: "Griechisch", flag: "🇬🇷" },
  { value: "romanian", label: "Rumänisch", flag: "🇷🇴" },
  { value: "arabic", label: "Arabisch", flag: "🇸🇦" },
  { value: "polish", label: "Polnisch", flag: "🇵🇱" },
  { value: "italian", label: "Italienisch", flag: "🇮🇹" },
  { value: "spanish", label: "Spanisch", flag: "🇪🇸" },
  { value: "portuguese", label: "Portugiesisch", flag: "🇵🇹" },
  { value: "russian", label: "Russisch", flag: "🇷🇺" },
  { value: "balkan", label: "Balkan", flag: "🌍" },
  { value: "african", label: "Afrikanisch", flag: "🌍" },
  { value: "latin", label: "Lateinamerikanisch", flag: "🌎" },
  { value: "asian", label: "Asiatisch", flag: "🌏" },
  { value: "kurdish", label: "Kurdisch", flag: "☀️" },
  { value: "persian", label: "Persisch", flag: "🇮🇷" },
  { value: "international", label: "International", flag: "🌐" },
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

const SLIDE_DURATION = 7000;

function HeroSlider({ slides }: { slides: EventListItem[] }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = slides.length;

  const startTimers = useCallback((startIdx?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);

    // Progress bar ticks every 50ms
    let prog = 0;
    progressRef.current = setInterval(() => {
      prog += 50;
      setProgress(Math.min((prog / SLIDE_DURATION) * 100, 100));
    }, 50);

    if (count > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((p) => (p + 1) % count);
        prog = 0;
        setProgress(0);
      }, SLIDE_DURATION);
    }
  }, [count]);

  useEffect(() => {
    startTimers();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [count, startTimers]);

  function nav(idx: number) {
    setCurrent(((idx % count) + count) % count);
    startTimers();
  }

  if (count === 0) return null;
  const slide = slides[current];

  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl shadow-2xl shadow-black/40">
      {/* All images stacked – fade transition */}
      <div className="relative aspect-[16/7] sm:aspect-[2.5/1] lg:aspect-[3/1] w-full">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            {s.imageUrl ? (
              <img
                src={s.imageUrl}
                alt={s.title}
                className="h-full w-full object-cover"
                style={{ transform: i === current ? "scale(1.03)" : "scale(1)", transition: "transform 8s ease-out" }}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-accent-600 via-purple-800 to-surface-900" />
            )}
          </div>
        ))}

        {/* Cinematic overlays */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-surface-950/95 via-surface-950/40 to-surface-950/10" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 z-[2] opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* Content overlay */}
        <div className="absolute inset-0 z-[3] flex flex-col justify-end p-5 sm:justify-center sm:p-10 lg:p-16">
          <div className="max-w-xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4 animate-[fadeSlideUp_0.6s_ease-out]">
              {slide.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neon-green/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-950 shadow-lg shadow-neon-green/20">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Featured
                </span>
              )}
              {slide.isPromoted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-950 shadow-lg shadow-amber-400/20">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Promoted
                </span>
              )}
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                {categoryLabel(slide.category)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-white sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight">
              {slide.title}
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm text-white/60 line-clamp-2 sm:text-base lg:text-lg max-w-lg leading-relaxed">
              {slide.shortDescription}
            </p>

            {/* Meta info – glassmorphism card */}
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
              {slide.price && (
                <>
                  <span className="h-4 w-px bg-white/20" />
                  <span className="text-xs sm:text-sm font-bold text-accent-300">{slide.price}</span>
                </>
              )}
            </div>

            {/* CTA Button */}
            <div className="mt-5">
              <Link
                to={`/events/${slide.id}`}
                className="group/btn inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-accent-500/25 transition-all duration-300 hover:bg-accent-400 hover:shadow-accent-500/40 hover:gap-3"
              >
                Event ansehen
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-0.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Right side: mini preview cards (desktop only) */}
        {count > 1 && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[4] hidden xl:flex flex-col gap-3">
            {slides.slice(0, 5).map((s, i) => (
              <button
                key={s.id}
                onClick={() => nav(i)}
                className={`group/thumb flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-300 w-56 ${
                  i === current
                    ? "border-accent-400/50 bg-white/[0.12] backdrop-blur-xl shadow-lg shadow-accent-500/10"
                    : "border-white/[0.06] bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.12]"
                }`}
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-accent-900/50 text-xs">
                      {CATEGORY_ICONS[s.category] || "🎉"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold truncate transition-colors ${i === current ? "text-white" : "text-surface-300 group-hover/thumb:text-white"}`}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-surface-500 truncate">{formatDate(s.startsAt)}</p>
                </div>
                {i === current && <div className="h-5 w-0.5 rounded-full bg-accent-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}

        {/* Navigation arrows */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); nav(current - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[4] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white hover:border-white/20 hover:scale-110"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); nav(current + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[4] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white hover:border-white/20 hover:scale-110 xl:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </>
        )}

        {/* Bottom: progress bar + dots */}
        {count > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-[4]">
            {/* Progress bar */}
            <div className="h-[3px] w-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-accent-400 to-accent-500 transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-2 py-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); nav(i); }}
                  className={`rounded-full transition-all duration-500 ${
                    i === current
                      ? "h-2.5 w-8 bg-accent-400 shadow-md shadow-accent-400/30"
                      : "h-2.5 w-2.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Slide counter */}
        {count > 1 && (
          <div className="absolute top-4 right-4 z-[4] rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold text-white/70 backdrop-blur-md xl:hidden">
            {current + 1} / {count}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [view, setView] = useState<"grid" | "list">("grid");
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

  // Load featured events for slider
  useEffect(() => {
    api.events.featured().then((r) => setFeatured(r.events)).catch(() => {});
  }, []);

  // Load favorite IDs
  useEffect(() => {
    if (user) api.events.favoriteIds().then((r) => setFavIds(new Set(r.ids))).catch(() => {});
  }, [user]);

  function handleFavToggle(eventId: string, favorited: boolean) {
    setFavIds((prev) => {
      const next = new Set(prev);
      if (favorited) next.add(eventId); else next.delete(eventId);
      return next;
    });
  }

  useEffect(() => {
    load();
  }, [category, city, community]);

  // Use featured events for hero, or fall back to first few events with images
  const heroSlides = featured.length > 0
    ? featured.filter((e) => e.imageUrl).slice(0, 8)
    : events.filter((e) => e.imageUrl).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Hero Slider */}
      {heroSlides.length > 0 && <HeroSlider slides={heroSlides} />}

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

      {/* Community Filter */}
      {community && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-surface-400">Community:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 border border-accent-500/25 px-3 py-1 text-sm font-medium text-accent-300">
            {COMMUNITIES.find((c) => c.value === community)?.flag} {COMMUNITIES.find((c) => c.value === community)?.label || community}
            <button onClick={() => setCommunity("")} className="ml-1 text-accent-400 hover:text-white transition-colors">×</button>
          </span>
        </div>
      )}

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
                      {ev.isPromoted && (
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
                      <FavoriteButton eventId={ev.id} isFavorited={favIds.has(ev.id)} onToggle={handleFavToggle} />
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
                      {ev.isPromoted && (
                        <span className="rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-surface-950">
                          Promoted
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
                  <div className="hidden items-center gap-2 sm:flex">
                    <FavoriteButton eventId={ev.id} isFavorited={favIds.has(ev.id)} onToggle={handleFavToggle} size="sm" />
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
