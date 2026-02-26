import { useState } from "react";
import { api } from "../lib/api";
import { Input, Button } from "../ui/components";

interface SpotifyArtist {
  spotifyId: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  followers: number;
  popularity: number;
  spotifyUrl: string | null;
  alreadyImported?: boolean;
}

export function SpotifyImportPage() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(50);
  const [communityTag, setCommunityTag] = useState("");

  const COMMUNITIES = [
    { value: "turkish", label: "Türkisch" },
    { value: "croatian", label: "Kroatisch" },
    { value: "polish", label: "Polnisch" },
    { value: "romanian", label: "Rumänisch" },
    { value: "italian", label: "Italienisch" },
    { value: "greek", label: "Griechisch" },
    { value: "bulgarian", label: "Bulgarisch" },
    { value: "russian", label: "Russisch" },
    { value: "persian", label: "Persisch" },
    { value: "spanish", label: "Spanisch" },
    { value: "balkan", label: "Balkan" },
    { value: "latin", label: "Lateinamerika" },
    { value: "african", label: "Afrikanisch" },
    { value: "kurdish", label: "Kurdisch" },
    { value: "international", label: "International" },
  ];
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<SpotifyArtist[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSearch() {
    if (!query.trim()) {
      setError("Bitte Suchanfrage eingeben");
      return;
    }
    if (!communityTag) {
      setError("Bitte Community auswählen");
      return;
    }

    setSearching(true);
    setError("");
    setSuccess("");
    setResults([]);
    setSelected(new Set());

    try {
      const data = await api.post("/artists/search-spotify", { query, limit });
      setResults(data.artists || []);
      
      if (data.artists.length === 0) {
        setError("Keine Künstler gefunden. Versuche eine andere Suchanfrage.");
      }
    } catch (err: any) {
      setError(err.message || "Fehler bei der Suche");
    } finally {
      setSearching(false);
    }
  }

  function toggleSelect(spotifyId: string) {
    const newSelected = new Set(selected);
    if (newSelected.has(spotifyId)) {
      newSelected.delete(spotifyId);
    } else {
      newSelected.add(spotifyId);
    }
    setSelected(newSelected);
  }

  function selectAll() {
    setSelected(new Set(results.map((a) => a.spotifyId)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  async function handleImport() {
    if (selected.size === 0) {
      setError("Bitte mindestens einen Künstler auswählen");
      return;
    }
    if (!communityTag) {
      setError("Bitte Community auswählen");
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const selectedArtists = results.filter((a) => selected.has(a.spotifyId));
      
      // Convert to API format
      const artists = selectedArtists.map((artist) => {
        const tags = [...artist.genres.slice(0, 5)];
        if (communityTag && !tags.includes(communityTag)) {
          tags.unshift(communityTag);
        }

        return {
          name: artist.name,
          bio: `${artist.name} ist ein Künstler mit ${artist.followers.toLocaleString("de-DE")} Followern auf Spotify.`,
          imageUrl: artist.imageUrl || "",
          genre: artist.genres[0] || "",
          tags,
          spotify: artist.spotifyUrl || "",
        };
      });

      // Import in batches of 100 to avoid timeout
      const batchSize = 100;
      let totalCreated = 0;
      let totalSkipped = 0;

      for (let i = 0; i < artists.length; i += batchSize) {
        const batch = artists.slice(i, i + batchSize);
        
        const response = await fetch("/api/artists/bulk-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ artists: batch }),
        });

        if (!response.ok) {
          throw new Error(`Import fehlgeschlagen bei Batch ${Math.floor(i / batchSize) + 1}`);
        }

        const data = await response.json();
        totalCreated += data.created;
        totalSkipped += data.skipped;
      }

      setSuccess(`✓ ${totalCreated} Künstler importiert, ${totalSkipped} übersprungen`);
      
      // Remove imported artists from results
      setResults(results.filter((a) => !selected.has(a.spotifyId)));
      setSelected(new Set());
    } catch (err: any) {
      setError(err.message || "Fehler beim Import");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Spotify Künstler Import</h1>
          <p className="mt-2 text-surface-400">
            Suche nach Künstlern auf Spotify und wähle aus, welche importiert werden sollen
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8 rounded-xl border border-white/[0.08] bg-surface-900/50 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white">Suchanfrage</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="z.B. Turkish Rap, Greek Pop, Arabic Music..."
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Anzahl</label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                min={1}
                max={200}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-white">
              Community <span className="text-red-400">*</span>
            </label>
            <select
              value={communityTag}
              onChange={(e) => setCommunityTag(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-surface-800 px-4 py-2.5 text-white outline-none transition-all focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20"
            >
              <option value="">-- Bitte Community auswählen --</option>
              {COMMUNITIES.map((community) => (
                <option key={community.value} value={community.value}>
                  {community.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-surface-500">
              Pflichtfeld: Wird automatisch zu den Tags hinzugefügt, damit die Filter funktionieren
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? "Suche läuft..." : "🔍 Suchen"}
            </Button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
            {success}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            {/* Selection Controls */}
            <div className="mb-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-surface-900/50 p-4">
              <div className="text-sm text-surface-400">
                {selected.size} von {results.length} ausgewählt
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-accent-400 hover:text-accent-300"
                >
                  Alle auswählen
                </button>
                <span className="text-surface-600">|</span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-surface-400 hover:text-white"
                >
                  Alle abwählen
                </button>
              </div>
            </div>

            {/* Artist Grid */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((artist) => (
                <div
                  key={artist.spotifyId}
                  onClick={() => !artist.alreadyImported && toggleSelect(artist.spotifyId)}
                  className={`rounded-xl border p-4 transition-all ${
                    artist.alreadyImported
                      ? "border-white/[0.05] bg-surface-900/30 opacity-60 cursor-not-allowed"
                      : selected.has(artist.spotifyId)
                      ? "border-accent-500 bg-accent-500/10 cursor-pointer"
                      : "border-white/[0.08] bg-surface-900/50 hover:border-white/20 cursor-pointer"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={selected.has(artist.spotifyId)}
                        disabled={artist.alreadyImported}
                        onChange={() => {}}
                        className="h-5 w-5 rounded border-white/20 bg-surface-800 text-accent-500 focus:ring-accent-500 disabled:opacity-50"
                      />
                    </div>

                    {/* Image */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-800">
                      {artist.imageUrl ? (
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          🎤
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate font-semibold text-white">{artist.name}</h3>
                        {artist.alreadyImported && (
                          <span className="flex-shrink-0 rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                            ✓ Importiert
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-surface-400">
                        {artist.followers.toLocaleString("de-DE")} Follower
                      </p>
                      {artist.genres.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {artist.genres.slice(0, 2).map((genre, i) => (
                            <span
                              key={i}
                              className="rounded bg-surface-800 px-2 py-0.5 text-xs text-surface-300"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Button */}
            <div className="sticky bottom-6 flex justify-center">
              <Button
                onClick={handleImport}
                disabled={importing || selected.size === 0}
                className="shadow-xl"
              >
                {importing
                  ? "Importiere..."
                  : `✓ ${selected.size} Künstler importieren`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
