import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const I = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-surface-500">
    <path d={d} />
  </svg>
);

type MenuGroup = {
  title: string;
  icon: JSX.Element;
  items: { label: string; category: string }[];
};

const MENU_GROUPS: MenuGroup[] = [
  {
    title: "Musik & Bühne",
    icon: <I d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
    items: [
      { label: "Konzerte", category: "KONZERT" },
      { label: "Festivals", category: "FESTIVAL" },
      { label: "Musicals", category: "MUSICAL" },
      { label: "Oper", category: "OPER" },
      { label: "Kabarett", category: "KABARETT" },
      { label: "Open Mic", category: "OPEN_MIC" },
      { label: "DJ Events", category: "DJ_EVENT" },
    ],
  },
  {
    title: "Bühne & Show",
    icon: <I d="M2 16V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12M6 22h12M12 16v6" />,
    items: [
      { label: "Theater", category: "THEATER" },
      { label: "Comedy", category: "COMEDY" },
      { label: "Tanz", category: "TANZ" },
      { label: "Zaubershows", category: "ZAUBERSHOW" },
    ],
  },
  {
    title: "Kunst & Kultur",
    icon: <I d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4M2 7h20M12 7v5" />,
    items: [
      { label: "Ausstellungen", category: "AUSSTELLUNG" },
      { label: "Lesungen", category: "LESUNG" },
      { label: "Film", category: "FILM" },
      { label: "Fotografie", category: "FOTOGRAFIE" },
      { label: "Museen", category: "MUSEUM" },
    ],
  },
  {
    title: "Märkte & Messen",
    icon: <I d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0" />,
    items: [
      { label: "Flohmärkte", category: "FLOHMARKT" },
      { label: "Wochenmärkte", category: "WOCHENMARKT" },
      { label: "Weihnachtsmärkte", category: "WEIHNACHTSMARKT" },
      { label: "Messen", category: "MESSE" },
      { label: "Food Festivals", category: "FOOD_FESTIVAL" },
    ],
  },
  {
    title: "Sport & Fitness",
    icon: <I d="M6.5 6.5 17.5 17.5M6.5 17.5 17.5 6.5M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />,
    items: [
      { label: "Sportevents", category: "SPORT" },
      { label: "Laufevents", category: "LAUF" },
      { label: "Turniere", category: "TURNIER" },
      { label: "Yoga", category: "YOGA" },
      { label: "Wanderungen", category: "WANDERUNG" },
    ],
  },
  {
    title: "Familie & Kinder",
    icon: <I d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
    items: [
      { label: "Kindertheater", category: "KINDERTHEATER" },
      { label: "Familientage", category: "FAMILIENTAG" },
      { label: "Kinder-Workshops", category: "KINDER_WORKSHOP" },
    ],
  },
  {
    title: "Essen & Trinken",
    icon: <I d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8ZM6 1v3M10 1v3M14 1v3" />,
    items: [
      { label: "Weinproben", category: "WEINPROBE" },
      { label: "Craft Beer", category: "CRAFT_BEER" },
      { label: "Kochkurse", category: "KOCHKURS" },
      { label: "Food Trucks", category: "FOOD_TRUCK" },
      { label: "Kulinarische Touren", category: "KULINARISCHE_TOUR" },
    ],
  },
  {
    title: "Bildung & Business",
    icon: <I d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />,
    items: [
      { label: "Workshops", category: "WORKSHOP" },
      { label: "Seminare", category: "SEMINAR" },
      { label: "Konferenzen", category: "KONFERENZ" },
      { label: "Networking", category: "NETWORKING" },
      { label: "Vorträge", category: "VORTRAG" },
    ],
  },
  {
    title: "Nachtleben",
    icon: <I d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />,
    items: [
      { label: "Clubnächte", category: "CLUBNACHT" },
      { label: "Karaoke", category: "KARAOKE" },
      { label: "Partys", category: "PARTY" },
    ],
  },
  {
    title: "Feste & Saisonales",
    icon: <I d="M12 2v4M6.34 6.34l2.83 2.83M2 12h4M6.34 17.66l2.83-2.83M12 18v4M17.66 17.66l-2.83-2.83M18 12h4M17.66 6.34l-2.83 2.83" />,
    items: [
      { label: "Karneval", category: "KARNEVAL" },
      { label: "Oktoberfest", category: "OKTOBERFEST" },
      { label: "Silvester", category: "SILVESTER" },
      { label: "Stadtfeste", category: "STADTFEST" },
      { label: "Straßenfeste", category: "STRASSENFEST" },
    ],
  },
];

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  }

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {/* Trigger */}
      <button
        className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${open ? "text-white" : "text-surface-400 hover:text-white"}`}
        onClick={() => setOpen(!open)}
      >
        Veranstaltungen
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute left-1/2 top-full pt-3 -translate-x-1/2 transition-all duration-200 ${
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-2"
        }`}
        style={{ width: "min(90vw, 820px)" }}
      >
        <div className="rounded-2xl border border-white/[0.08] bg-surface-900/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Entdecke Veranstaltungen</h3>
            <Link
              to="/events"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 text-xs font-medium text-accent-400 hover:text-accent-300 transition-colors"
            >
              Alle Events anzeigen
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Grid of groups */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
            {MENU_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-2 flex items-center gap-1.5">
                  {group.icon}
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">{group.title}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.category}
                      to={`/events?category=${item.category}`}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-1.5 text-sm text-surface-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-5 flex items-center gap-4 border-t border-white/[0.06] pt-4">
            <Link
              to="/events?category=SONSTIGES"
              onClick={() => setOpen(false)}
              className="text-xs text-surface-500 hover:text-white transition-colors"
            >
              Sonstiges
            </Link>
            <span className="text-surface-700">·</span>
            <span className="text-[11px] text-surface-600">
              Über 45 Kategorien für lokale Veranstaltungen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
