import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, Artist } from "../lib/api";
import { useAuth } from "../state/auth";
import { Input, Textarea, Button, Label } from "../ui/components";
import { ArtistSelect } from "../ui/ArtistSelect";

const CATEGORIES = [
  "KONZERT", "FESTIVAL", "MUSICAL", "OPER", "KABARETT", "OPEN_MIC", "DJ_EVENT",
  "THEATER", "COMEDY", "TANZ", "ZAUBERSHOW",
  "AUSSTELLUNG", "LESUNG", "FILM", "FOTOGRAFIE", "MUSEUM",
  "FLOHMARKT", "WOCHENMARKT", "WEIHNACHTSMARKT", "MESSE", "FOOD_FESTIVAL",
  "SPORT", "LAUF", "TURNIER", "YOGA", "WANDERUNG",
  "KINDERTHEATER", "FAMILIENTAG", "KINDER_WORKSHOP",
  "WEINPROBE", "CRAFT_BEER", "KOCHKURS", "FOOD_TRUCK", "KULINARISCHE_TOUR",
  "WORKSHOP", "SEMINAR", "KONFERENZ", "NETWORKING", "VORTRAG",
  "CLUBNACHT", "KARAOKE", "PARTY",
  "KARNEVAL", "OKTOBERFEST", "SILVESTER", "STADTFEST", "STRASSENFEST",
  "SONSTIGES",
];

const COMMUNITIES = [
  { value: "", label: "Keine Community", flag: "" },
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

type Props = { mode: "create" | "edit" };

export function EventFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, refresh: refreshAuth } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [promote, setPromote] = useState(false);
  const [alreadyPromoted, setAlreadyPromoted] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState(false);
  const [heroFocusY, setHeroFocusY] = useState(50);
  const [savingFocus, setSavingFocus] = useState(false);
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "KONZERT",
    startsAt: "",
    endsAt: "",
    address: "",
    city: "",
    country: "DE",
    imageUrl: "",
    heroVideoUrl: "",
    ticketUrl: "",
    price: "",
    tagsInput: "",
    community: "",
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Load artists list for auto-fill
  useEffect(() => {
    api.artists.list().then((r) => setAllArtists(r.artists)).catch(() => {});
  }, []);

  // Auto-fill address/city from user profile (only on create, once)
  useEffect(() => {
    if (mode === "create" && user && !profileLoaded) {
      setProfileLoaded(true);
      setForm((prev) => ({
        ...prev,
        address: prev.address || user.address || "",
        city: prev.city || user.city || "",
      }));
    }
  }, [mode, user, profileLoaded]);

  // Auto-fill from selected artist (description, image) – only when artist selection changes and fields are empty
  function handleArtistChange(ids: string[]) {
    setSelectedArtistIds(ids);
    if (ids.length > 0 && allArtists.length > 0) {
      const lastAdded = allArtists.find((a) => a.id === ids[ids.length - 1]);
      if (lastAdded) {
        setForm((prev) => ({
          ...prev,
          description: prev.description || lastAdded.bio || "",
          imageUrl: prev.imageUrl || lastAdded.imageUrl || "",
        }));
      }
    }
  }

  useEffect(() => {
    if (mode === "edit" && id) {
      (async () => {
        try {
          const res = await api.events.get(id);
          const e = res.event;
          setForm({
            title: e.title,
            shortDescription: e.shortDescription,
            description: e.description,
            category: e.category,
            startsAt: e.startsAt.slice(0, 16),
            endsAt: e.endsAt ? e.endsAt.slice(0, 16) : "",
            address: e.address,
            city: e.city,
            country: e.country,
            imageUrl: e.imageUrl || "",
            heroVideoUrl: (e as any).heroVideoUrl || "",
            ticketUrl: e.ticketUrl || "",
            price: e.price || "",
            tagsInput: (e.tags || []).join(", "),
            community: (e as any).community || "",
          });
          setProfileLoaded(true);
          if ((e as any).isPromoted) setAlreadyPromoted(true);
          if ((e as any).isFeatured) setIsFeatured(true);
          if ((e as any).heroFocusY != null) setHeroFocusY((e as any).heroFocusY);
          if ((e as any).artists) setSelectedArtistIds((e as any).artists.map((a: any) => a.id));
        } catch {
          setError("Event konnte nicht geladen werden.");
        }
      })();
    }
  }, [mode, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const tags = form.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { tagsInput, community, ...rest } = form;
    const payload = {
      ...rest,
      community: community || undefined,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      imageUrl: form.imageUrl || undefined,
      heroVideoUrl: form.heroVideoUrl || undefined,
      ticketUrl: form.ticketUrl || undefined,
      price: form.price || undefined,
      tags,
      heroFocusY,
    };

    try {
      if (mode === "create") {
        await api.events.create({ ...payload, promote, artistIds: selectedArtistIds });
        if (promote) { await refreshAuth(); }
      } else if (id) {
        await api.events.update(id, { ...payload, promote, artistIds: selectedArtistIds });
        if (promote) { await refreshAuth(); }
      }
      navigate("/dashboard");
    } catch {
      setError("Speichern fehlgeschlagen. Bitte prüfe die Eingaben.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-white">
        {mode === "create" ? "Neues Event erstellen" : "Event bearbeiten"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Künstler zuweisen – ganz oben */}
        <div>
          <Label>Künstler (optional – befüllt Beschreibung & Bild automatisch)</Label>
          <ArtistSelect selectedIds={selectedArtistIds} onChange={handleArtistChange} />
        </div>

        <div>
          <Label>Titel</Label>
          <Input required value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <Label>Kurzbeschreibung (10–200 Zeichen)</Label>
          <Input
            required
            minLength={10}
            maxLength={200}
            value={form.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
          />
        </div>
        <div>
          <Label>Ausführliche Beschreibung</Label>
          <Textarea
            required
            rows={5}
            minLength={20}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div>
          <Label>Kategorie</Label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-accent-500 focus:ring-2"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Start (Datum & Uhrzeit)</Label>
            <Input type="datetime-local" required value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
          </div>
          <div>
            <Label>Ende (optional)</Label>
            <Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Adresse</Label>
          <Input required value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Stadt</Label>
            <Input required value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <Label>Land</Label>
            <Input required value={form.country} onChange={(e) => set("country", e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Event-Bild (optional)</Label>
          <div className="space-y-2">
            {form.imageUrl && (
              <div className="relative w-full overflow-hidden rounded-lg border border-white/10" style={{ aspectRatio: "16/9", maxHeight: 200 }}>
                <img src={form.imageUrl} alt="Vorschau" className="h-full w-full object-cover" onError={(e: any) => { e.target.style.display = "none"; }} />
              </div>
            )}
            <div className="flex gap-2">
              <Input type="url" placeholder="https://… oder Bild hochladen →" value={form.imageUrl} onChange={(e: any) => set("imageUrl", e.target.value)} className="flex-1" />
              <label className="shrink-0 cursor-pointer rounded-lg bg-accent-500/10 px-4 py-2 text-sm font-medium text-accent-400 hover:bg-accent-500/20 transition-colors flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Hochladen
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e: any) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await api.events.uploadImage(file);
                      set("imageUrl", res.imageUrl);
                    } catch {
                      alert("Bild-Upload fehlgeschlagen.");
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
        <div>
          <Label>Hero Video (optional)</Label>
          <Input type="url" placeholder="https://example.com/video.mp4" value={form.heroVideoUrl} onChange={(e) => set("heroVideoUrl", e.target.value)} />
          <p className="mt-1 text-[11px] text-surface-500">Direkte Video-URL (MP4, WebM, OGG). Wird im Hero-Slider stumm abgespielt.</p>
        </div>
        <div>
          <Label>Ticket-URL (optional)</Label>
          <Input type="url" placeholder="https://www.eventbrite.de/…" value={form.ticketUrl} onChange={(e) => set("ticketUrl", e.target.value)} />
        </div>
        <div>
          <Label>Preis (optional, z.B. "Kostenlos" oder "Ab 15 €")</Label>
          <Input placeholder="Kostenlos" value={form.price} onChange={(e) => set("price", e.target.value)} />
        </div>
        <div>
          <Label>Tags (kommagetrennt, z.B. "Outdoor, Familienfreundlich")</Label>
          <Input placeholder="Live-Musik, Barrierefrei" value={form.tagsInput} onChange={(e) => set("tagsInput", e.target.value)} />
        </div>

        {/* Community */}
        <div>
          <Label>Community (optional – für kulturelle Events)</Label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-accent-500 focus:ring-2"
            value={form.community}
            onChange={(e) => set("community", e.target.value)}
          >
            {COMMUNITIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.flag ? `${c.flag} ${c.label}` : c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Promotion Option */}
        {(user?.isPartner || user?.isAdmin) && (user?.promotionTokens ?? 0) > 0 && !alreadyPromoted && (
          <label className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={promote}
              onChange={(e) => setPromote(e.target.checked)}
              className="accent-amber-400 h-4 w-4"
            />
            <div>
              <div className="text-sm font-medium text-amber-400">Event promoten</div>
              <div className="text-xs text-amber-400/70">Promoted Events werden zuerst angezeigt. Du hast {user.promotionTokens} Token{user.promotionTokens !== 1 ? "s" : ""}.</div>
            </div>
          </label>
        )}

        {/* Featured Toggle (Admin only, edit mode) */}
        {user?.isAdmin && mode === "edit" && id && (
          <div className="space-y-4">
            <button
              type="button"
              disabled={togglingFeatured}
              onClick={async () => {
                setTogglingFeatured(true);
                try {
                  const res = await api.events.toggleFeatured(id);
                  setIsFeatured(res.isFeatured);
                } catch { /* ignore */ }
                setTogglingFeatured(false);
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all w-full ${
                isFeatured
                  ? "border border-neon-green/30 bg-neon-green/15 text-neon-green hover:bg-neon-green/25"
                  : "border border-white/10 bg-white/5 text-surface-400 hover:bg-white/10 hover:text-white"
              } disabled:opacity-50`}
            >
              {togglingFeatured ? "..." : isFeatured ? "★ Featured (aktiv) – wird im Hero-Slider angezeigt" : "☆ Als Featured markieren (Hero-Slider)"}
            </button>

            {/* Hero Focal Point Picker */}
            {isFeatured && form.imageUrl && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-surface-400">Hero-Bildausschnitt (Fokuspunkt)</div>
                <div className="relative overflow-hidden rounded-lg border border-white/10" style={{ aspectRatio: "16/9" }}>
                  <div
                    className="absolute inset-0 bg-cover bg-no-repeat"
                    style={{
                      backgroundImage: `url(${form.imageUrl})`,
                      backgroundPosition: `center ${heroFocusY}%`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-2 flex justify-center">
                    <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {heroFocusY === 0 ? "Oben" : heroFocusY === 50 ? "Mitte" : heroFocusY === 100 ? "Unten" : `${heroFocusY}%`}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={heroFocusY}
                  onChange={(e) => setHeroFocusY(Number(e.target.value))}
                  className="w-full accent-accent-500"
                />
                <div className="flex justify-between text-[10px] text-surface-500">
                  <span>Oben</span>
                  <span>Mitte</span>
                  <span>Unten</span>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={busy}>
            {busy ? "Speichere…" : mode === "create" ? "Event erstellen" : "Speichern"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
}
