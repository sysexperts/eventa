import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Artist } from "../lib/api";

interface ArtistSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function ArtistSelect({ selectedIds, onChange }: ArtistSelectProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.artists.list().then((r) => setArtists(r.artists)).catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.genre || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedArtists = artists.filter((a) => selectedIds.includes(a.id));

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* Selected artists as chips */}
      <div
        className="flex flex-wrap gap-1.5 min-h-[42px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {selectedArtists.length === 0 && (
          <span className="text-sm text-surface-500 py-0.5">Künstler auswählen...</span>
        )}
        {selectedArtists.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-300"
          >
            {a.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(a.id);
              }}
              className="ml-0.5 text-indigo-400 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <div className="ml-auto flex items-center text-surface-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-surface-900 shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-white/[0.06]">
            <input
              type="text"
              placeholder="Künstler suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-surface-500 outline-none focus:border-indigo-500/50"
              autoFocus
            />
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-surface-500">
                Kein Künstler gefunden
              </div>
            )}
            {filtered.map((a) => {
              const selected = selectedIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggle(a.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-white/5 ${
                    selected ? "bg-indigo-500/10" : ""
                  }`}
                >
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt="" className="h-7 w-7 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      <span className="text-[10px] font-bold text-indigo-400">{a.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{a.name}</div>
                    {a.genre && <div className="text-xs text-surface-500">{a.genre}</div>}
                  </div>
                  {selected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-400 shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigate to artist admin page */}
          <div className="border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => navigate("/admin/artists")}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-indigo-400 hover:bg-white/5 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Neuen Künstler erstellen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
