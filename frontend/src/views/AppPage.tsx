import { useState } from "react";
import { Smartphone, Bell, MapPin, Calendar, Star, Zap, Shield, ChevronRight, Check } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Events in deiner Nähe",
    description: "GPS-basierte Suche zeigt dir Events in deinem Umkreis – von 1 km bis 100 km.",
    gradient: "from-accent-500 to-accent-400",
  },
  {
    icon: Bell,
    title: "Push-Benachrichtigungen",
    description: "Verpasse nie wieder ein Event. Erhalte Erinnerungen und Neuigkeiten direkt auf dein Handy.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: Calendar,
    title: "Persönlicher Kalender",
    description: "Speichere Events in deinem Kalender und synchronisiere sie mit Apple Calendar oder Google.",
    gradient: "from-cyan-500 to-teal-400",
  },
  {
    icon: Star,
    title: "Favoriten & Merkliste",
    description: "Speichere Events und Veranstalter die dich interessieren – immer griffbereit.",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: Zap,
    title: "Blitzschnelle Suche",
    description: "Filtere nach Kategorie, Datum, Preis und Stadt – in Echtzeit, ohne Ladezeit.",
    gradient: "from-emerald-500 to-green-400",
  },
  {
    icon: Shield,
    title: "Verifizierte Events",
    description: "Alle Events werden geprüft. Kein Spam, keine Fake-Veranstaltungen.",
    gradient: "from-rose-500 to-pink-400",
  },
];

const PLATFORMS = [
  {
    name: "App Store",
    sub: "Für iPhone & iPad",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
  {
    name: "Google Play",
    sub: "Für Android",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
      </svg>
    ),
  },
];

export function AppPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent-500/10 blur-[120px]" />
          <div className="absolute top-60 -right-40 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[100px]" />
          <div className="absolute top-40 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/6 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Left: Text */}
            <div>
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
                </span>
                <span className="text-xs font-semibold text-accent-300">Coming Soon – Trag dich ein</span>
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                LocalEvents
                <br />
                <span className="bg-gradient-to-r from-accent-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  in deiner Tasche
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-surface-400">
                Die LocalEvents App bringt alle Veranstaltungen in deiner Stadt direkt auf dein Smartphone.
                Entdecke, speichere und verpasse nie wieder ein Event.
              </p>

              {/* Highlights */}
              <ul className="mt-8 space-y-3">
                {["Kostenlos & werbefrei", "GPS-basierte Event-Suche", "Push-Benachrichtigungen", "Offline-Merkliste"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-surface-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/20">
                      <Check className="h-3 w-3 text-accent-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Email Waitlist */}
              <div className="mt-10">
                {submitted ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-300">Du bist auf der Liste!</p>
                      <p className="text-xs text-surface-500">Wir benachrichtigen dich sobald die App verfügbar ist.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="deine@email.de"
                      required
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-surface-500 outline-none transition focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20"
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-400 active:scale-95"
                    >
                      Benachrichtigen
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
                <p className="mt-2 text-xs text-surface-600">Kein Spam. Nur eine E-Mail wenn die App live geht.</p>
              </div>

              {/* Store Buttons (disabled) */}
              <div className="mt-8 flex flex-wrap gap-3">
                {PLATFORMS.map((p) => (
                  <div
                    key={p.name}
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 opacity-50"
                    title="Bald verfügbar"
                  >
                    <span className="text-white">{p.icon}</span>
                    <div>
                      <div className="text-[10px] text-surface-500">Bald verfügbar</div>
                      <div className="text-sm font-semibold text-white">{p.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glow behind phone */}
                <div className="absolute inset-0 scale-75 rounded-[3rem] bg-accent-500/20 blur-3xl" />

                {/* Phone frame */}
                <div className="relative h-[580px] w-[280px] rounded-[3rem] border border-white/10 bg-surface-900 shadow-2xl shadow-black/60">
                  {/* Notch */}
                  <div className="absolute left-1/2 top-4 h-6 w-24 -translate-x-1/2 rounded-full bg-surface-950" />

                  {/* Screen content */}
                  <div className="absolute inset-2 overflow-hidden rounded-[2.5rem] bg-surface-950">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 pt-10 text-[10px] text-surface-500">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <span>●●●</span>
                        <span>WiFi</span>
                        <span>🔋</span>
                      </div>
                    </div>

                    {/* App header */}
                    <div className="px-5 pt-4">
                      <p className="text-[10px] text-surface-500">Guten Abend 👋</p>
                      <p className="text-sm font-bold text-white">Events in München</p>
                    </div>

                    {/* Search bar */}
                    <div className="mx-5 mt-3 rounded-xl bg-white/5 px-3 py-2">
                      <p className="text-[10px] text-surface-500">🔍  Events suchen...</p>
                    </div>

                    {/* Filter chips */}
                    <div className="mt-3 flex gap-2 overflow-hidden px-5">
                      {["Heute", "Wochenende", "Konzerte", "Gratis"].map((chip, i) => (
                        <span
                          key={chip}
                          className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-semibold ${i === 0 ? "bg-accent-500 text-white" : "bg-white/5 text-surface-400"}`}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    {/* Event cards */}
                    <div className="mt-4 space-y-3 px-5">
                      {[
                        { title: "Jazz Night", cat: "Konzert", time: "Heute, 20:00", color: "from-violet-500 to-purple-600" },
                        { title: "Flohmarkt Schwabing", cat: "Markt", time: "Sa, 09:00", color: "from-amber-500 to-orange-600" },
                        { title: "Comedy Club", cat: "Comedy", time: "Fr, 21:00", color: "from-cyan-500 to-teal-600" },
                      ].map((ev) => (
                        <div key={ev.title} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                          <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${ev.color}`} />
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold text-white">{ev.title}</p>
                            <p className="text-[9px] text-surface-500">{ev.cat} · {ev.time}</p>
                          </div>
                          <Star className="ml-auto h-3 w-3 shrink-0 text-surface-600" />
                        </div>
                      ))}
                    </div>

                    {/* Bottom nav */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-around border-t border-white/5 bg-surface-950 px-4 py-3">
                      {[
                        { icon: "🏠", label: "Home" },
                        { icon: "🔍", label: "Suche" },
                        { icon: "❤️", label: "Saved" },
                        { icon: "👤", label: "Profil" },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center gap-0.5">
                          <span className="text-sm">{item.icon}</span>
                          <span className="text-[8px] text-surface-600">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative border-t border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-accent-500/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Alles was du brauchst,{" "}
              <span className="bg-gradient-to-r from-accent-400 to-violet-400 bg-clip-text text-transparent">
                in einer App
              </span>
            </h2>
            <p className="mt-4 text-surface-400">
              Entwickelt für Event-Liebhaber. Gebaut für Veranstalter.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-surface-400">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-violet-500 shadow-xl shadow-accent-500/20">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
            Sei der Erste der es weiß
          </h2>
          <p className="mt-4 text-surface-400">
            Trag dich in die Warteliste ein und erhalte als Erster Zugang zur LocalEvents App.
          </p>
          {submitted ? (
            <div className="mx-auto mt-8 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
              <Check className="h-5 w-5 text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-300">Du bist auf der Liste!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-surface-500 outline-none transition focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-400 active:scale-95"
              >
                Eintragen
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-surface-600">
            Kein Spam. Abmeldung jederzeit möglich. Deine Daten werden nicht weitergegeben.
          </p>
        </div>
      </section>
    </div>
  );
}
