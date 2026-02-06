import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  { label: "Konzerte", cat: "KONZERT", img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80" },
  { label: "Theater", cat: "THEATER", img: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80" },
  { label: "Lesungen", cat: "LESUNG", img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80" },
  { label: "Comedy", cat: "COMEDY", img: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80" },
  { label: "Sonstiges", cat: "SONSTIGES", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80" },
];

function EventCard({ ev, size = "normal" }: { ev: EventListItem; size?: "normal" | "compact" }) {
  if (size === "compact") {
    return (
      <Link
        to={`/events/${ev.id}`}
        className="group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.05]"
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-accent-500/5"
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

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featured, setFeatured] = useState<EventListItem[]>([]);
  const [upcoming, setUpcoming] = useState<EventListItem[]>([]);
  const [weekendEvents, setWeekendEvents] = useState<EventListItem[]>([]);
  const [cities, setCities] = useState<{ name: string; count: number }[]>([]);

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

    const { from, to } = getWeekendRange();
    api.events.list({ from, to }).then((r) => setWeekendEvents(r.events.slice(0, 6))).catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <div>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=60')] bg-cover bg-center opacity-[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-950" />
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-accent-500/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-neon-purple/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-surface-300 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse-slow" />
              Neue Events in deiner Nähe
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Erlebe deine Stadt
              <span className="block text-gradient">wie nie zuvor</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base text-surface-400 sm:text-lg">
              Konzerte, Theater, Lesungen, Comedy und mehr – entdecke Veranstaltungen in deiner Nähe.
            </p>

            {/* ── Search Bar ── */}
            <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-2xl">
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-4 text-surface-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach Events, Künstlern, Orten..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-12 pr-36 text-sm text-white placeholder-surface-500 outline-none backdrop-blur-xl transition-all focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-accent-500/30"
                />
                <button
                  type="submit"
                  className="absolute right-2 rounded-full bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400 hover:shadow-accent-500/40"
                >
                  Suchen
                </button>
              </div>

              {/* Quick search suggestions */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-surface-600">Beliebt:</span>
                {["Konzert", "Comedy", "Theater", "Open Air", "DJ"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => navigate(`/events?q=${encodeURIComponent(term)}`)}
                    className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-surface-400 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

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
              <EventCard key={ev.id} ev={ev} />
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
                  <EventCard ev={ev} size="compact" />
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
              <EventCard key={ev.id} ev={ev} />
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
           