import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, Artist } from "../lib/api";
import { useAuth } from "../state/auth";
import { Input, Textarea, Button, Label } from "../ui/components";
import { ArtistSelect } from "../ui/ArtistSelect";
import { CitySelect } from "../ui/CitySelect";

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

  const sel = "w-full rounded-xl border border-white/[0.08] bg-surface-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30 appearance-none cursor-pointer";

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-white/[0.06] bg-surface-950/50 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate("/dashboard")} className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-white/[0.06] hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{mode === "create" ? "Neues Event erstellen" : "Event bearbeiten"}</h1>
              <p className="text-sm text-surface-500">{mode === "create" ? "Fülle alle Pflichtfelder aus um dein Event zu veröffentlichen" : "Änderungen werden sofort übernommen"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Grundinfos ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">Grundinformationen</h2>
            <div>
              <Label>Titel *</Label>
              <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="z.B. Sommerfest im Stadtpark" />
            </div>
            <div>
              <Label>Kurzbeschreibung * <span className="text-surface-600 font-normal normal-case tracking-normal">(10–200 Zeichen)</span></Label>
              <Input required minLength={10} maxLength={200} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="Ein kurzer Teaser für die Event-Karte" />
              <p className="mt-1 text-right text-[11px] text-surface-600">{form.shortDescription.length}/200</p>
            </div>
            <div>
              <Label>Ausführliche Beschreibung *</Label>
              <Textarea required rows={5} minLength={20} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Beschreibe das Event ausführlich…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Kategorie *</Label>
                <div className="relative">
                  <select className={sel} value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase().replace(/_/g, " ")}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-surface-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              <div>
                <Label>Community <span className="text-surface-600 font-normal normal-case tracking-normal">(optional)</span></Label>
                <div className="relative">
                  <select className={sel} value={form.community} onChange={(e) => set("community", e.target.value)}>
                    {COMMUNITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-surface-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── Datum & Ort ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">Datum & Ort</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Start *</Label>
                <Input type="datetime-local" required value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
              </div>
              <div>
                <Label>Ende <span className="text-surface-600 font-normal normal-case tracking-normal">(optional)</span></Label>
                <Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Adresse *</Label>
              <Input required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Straße und Hausnummer" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Stadt *</Label>
                <CitySelect required value={form.city} onChange={(val) => set("city", val)} placeholder="Stadt auswählen" />
              </div>
              <div>
                <Label>Land *</Label>
                <Input required value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="DE" />
              </div>
            </div>
          </div>
          {/* ── Medien ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">Medien</h2>
            <div>
              <Label>Event-Bild <span className="text-surface-600 font-normal normal-case tracking-normal">(optional)</span></Label>
              {form.imageUrl && (
                <div className="mb-2 relative w-full overflow-hidden rounded-xl border border-white/10" style={{ aspectRatio: "16/9", maxHeight: 220 }}>
                  <img src={form.imageUrl} alt="Vorschau" className="h-full w-full object-cover" onError={(e: any) => { e.target.style.display = "none"; }} />
                  <button type="button" onClick={() => set("imageUrl", "")} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Input type="url" placeholder="https://…" value={form.imageUrl} onChange={(e: any) => set("imageUrl", e.target.value)} className="flex-1" />
                <label className="shrink-0 cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-surface-300 hover:bg-white/[0.08] hover:text-white transition-colors flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={async (e: any) => { const file = e.target.files?.[0]; if (!file) return; try { const res = await api.events.uploadImage(file); set("imageUrl", res.imageUrl); } catch { alert("Bild-Upload fehlgeschlagen."); } e.target.value = ""; }} />
                </label>
              </div>
            </div>
            <div>
              <Label>Hero-Video <span className="text-surface-600 font-normal normal-case tracking-normal">(optional, max. 100 MB)</span></Label>
              <p className="mb-2 text-xs text-surface-500">Wird auf der Startseite abgespielt, wenn dein Event als Highlight ausgewählt wird.</p>
              {form.heroVideoUrl && (
                <div className="mb-2 relative w-full overflow-hidden rounded-xl border border-white/10" style={{ aspectRatio: "16/9", maxHeight: 220 }}>
                  <video src={form.heroVideoUrl} muted loop playsInline className="h-full w-full object-cover" onError={(e: any) => { e.target.style.display = "none"; }} />
                  <button type="button" onClick={() => set("heroVideoUrl", "")} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-3.5 text-sm text-surface-400 hover:border-accent-500/40 hover:bg-white/[0.04] hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                {form.heroVideoUrl ? "Video ersetzen…" : "Video hochladen (MP4, WebM, OGG)"}
                <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" className="hidden" onChange={async (e: any) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 100 * 1024 * 1024) { alert("Video darf maximal 100 MB groß sein."); e.target.value = ""; return; } try { const res = await api.events.uploadVideo(file); set("heroVideoUrl", res.videoUrl); } catch { alert("Video-Upload fehlgeschlagen."); } e.target.value = ""; }} />
              </label>
            </div>
          </div>

          {/* ── Tickets & Details ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">Tickets & Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Ticket-URL <span className="text-surface-600 font-normal normal-case tracking-normal">(optional)</span></Label>
                <Input type="url" placeholder="https://www.eventbrite.de/…" value={form.ticketUrl} onChange={(e) => set("ticketUrl", e.target.value)} />
              </div>
              <div>
                <Label>Preis <span className="text-surface-600 font-normal normal-case tracking-normal">(optional)</span></Label>
                <Input placeholder='z.B. "Kostenlos" oder "Ab 15 €"' value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Tags <span className="text-surface-600 font-normal normal-case tracking-normal">(kommagetrennt, optional)</span></Label>
              <Input placeholder="Outdoor, Familienfreundlich, Live-Musik" value={form.tagsInput} onChange={(e) => set("tagsInput", e.target.value)} />
            </div>
          </div>

          {/* ── Künstler ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">Künstler <span className="ml-1 text-surface-600 normal-case tracking-normal font-normal">(optional)</span></h2>
            <ArtistSelect selectedIds={selectedArtistIds} onChange={handleArtistChange} />
          </div>

          {/* ── Promotion ── */}
          {(user?.isPartner || user?.isAdmin) && (user?.promotionTokens ?? 0) > 0 && !alreadyPromoted && (
            <label className="flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-5 py-4 cursor-pointer select-none hover:bg-amber-500/[0.1] transition-colors">
              <input type="checkbox" checked={promote} onChange={(e) => setPromote(e.target.checked)} className="accent-amber-400 h-4 w-4 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-amber-400">Event promoten</div>
                <div className="text-xs text-amber-400/60 mt-0.5">Promoted Events erscheinen zuerst. Du hast {user?.promotionTokens} Token{(user?.promotionTokens ?? 0) !== 1 ? "s" : ""}.</div>
              </div>
            </label>
          )}

          {/* ── Admin: Featured ── */}
          {user?.isAdmin && mode === "edit" && id && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-500">Admin</h2>
              <button
                type="button"
                disabled={togglingFeatured}
                onClick={async () => {
                  setTogglingFeatured(true);
                  try { const res = await api.events.toggleFeatured(id); setIsFeatured(res.isFeatured); } catch { /* ignore */ }
                  setTogglingFeatured(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all w-full disabled:opacity-50 ${isFeatured ? "border border-neon-green/30 bg-neon-green/10 text-neon-green hover:bg-neon-green/20" : "border border-white/[0.08] bg-white/[0.03] text-surface-400 hover:bg-white/[0.06] hover:text-white"}`}
              >
                {togglingFeatured ? "…" : isFeatured ? "★ Featured aktiv – im Hero-Slider" : "☆ Als Featured markieren (Hero-Slider)"}
              </button>
              {isFeatured && form.imageUrl && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                  <p className="text-xs font-medium text-surface-400">Fokuspunkt im Hero-Bild</p>
                  <div className="relative overflow-hidden rounded-lg border border-white/10" style={{ aspectRatio: "16/9" }}>
                    <div className="absolute inset-0 bg-cover bg-no-repeat" style={{ backgroundImage: `url(${form.imageUrl})`, backgroundPosition: `center ${heroFocusY}%` }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-2 flex justify-center">
                      <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        {heroFocusY === 0 ? "Oben" : heroFocusY === 50 ? "Mitte" : heroFocusY === 100 ? "Unten" : `${heroFocusY}%`}
                      </span>
                    </div>
                  </div>
                  <input type="range" min={0} max={100} value={heroFocusY} onChange={(e) => setHeroFocusY(Number(e.target.value))} className="w-full accent-accent-500" />
                  <div className="flex justify-between text-[10px] text-surface-500"><span>Oben</span><span>Mitte</span><span>Unten</span></div>
                </div>
              )}
            </div>
          )}

          {/* ── Submit ── */}
          {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pb-8">
            <Button type="submit" disabled={busy}>
              {busy ? "Speichere…" : mode === "create" ? "Event erstellen" : "Änderungen speichern"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>
              Abbrechen
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
