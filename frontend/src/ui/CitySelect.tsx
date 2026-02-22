import { useState, useRef, useEffect } from "react";

const GERMAN_CITIES = [
  "Stuttgart", "Berlin", "München", "Hamburg", "Köln", "Frankfurt am Main",
  "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden",
  "Hannover", "Nürnberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
  "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden",
  "Gelsenkirchen", "Mönchengladbach", "Braunschweig", "Chemnitz", "Kiel",
  "Aachen", "Halle (Saale)", "Magdeburg", "Freiburg im Breisgau", "Krefeld",
  "Lübeck", "Oberhausen", "Erfurt", "Mainz", "Rostock", "Kassel",
  "Hagen", "Hamm", "Saarbrücken", "Mülheim an der Ruhr", "Potsdam",
  "Ludwigshafen am Rhein", "Oldenburg", "Leverkusen", "Osnabrück", "Solingen",
  "Heidelberg", "Herne", "Neuss", "Darmstadt", "Paderborn", "Regensburg",
  "Ingolstadt", "Würzburg", "Fürth", "Wolfsburg", "Offenbach am Main",
  "Ulm", "Heilbronn", "Pforzheim", "Göttingen", "Bottrop", "Trier",
  "Recklinghausen", "Reutlingen", "Bremerhaven", "Koblenz", "Bergisch Gladbach",
  "Jena", "Remscheid", "Erlangen", "Moers", "Siegen", "Hildesheim",
  "Salzgitter"
].sort();

type Props = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function CitySelect({ value, onChange, required, placeholder = "Stadt auswählen" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? GERMAN_CITIES.filter((city) => city.toLowerCase().includes(search.toLowerCase()))
    : GERMAN_CITIES;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  function selectCity(city: string) {
    onChange(city);
    setIsOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-white/[0.08] bg-surface-900/50 px-4 py-2.5 text-left text-sm text-white transition-all hover:border-white/[0.12] focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
      >
        {value || <span className="text-surface-500">{placeholder}</span>}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/[0.08] bg-surface-900 shadow-2xl">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Stadt suchen..."
              className="w-full rounded-lg border border-white/[0.08] bg-surface-800 px-3 py-2 text-sm text-white placeholder-surface-500 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => selectCity(city)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/[0.05] ${
                    city === value ? "bg-accent-500/10 text-accent-400" : "text-white"
                  }`}
                >
                  {city}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-surface-500">
                Keine Stadt gefunden
              </div>
            )}
          </div>
          {search && !filtered.includes(search) && (
            <div className="border-t border-white/[0.08] p-2">
              <button
                type="button"
                onClick={() => selectCity(search)}
                className="w-full rounded-lg bg-accent-500/10 px-3 py-2 text-left text-sm text-accent-400 transition-colors hover:bg-accent-500/20"
              >
                "{search}" verwenden
              </button>
            </div>
          )}
        </div>
      )}
      {required && <input type="hidden" required value={value} />}
    </div>
  );
}
