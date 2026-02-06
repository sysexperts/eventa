import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, Artist } from "../lib/api";
import { useAuth } from "../state/auth";
import { Input, Textarea, Button, Label } from "../ui/components";
import { ArtistSelect } from "../ui/ArtistSelect";

const CATEGORIES = ["KONZERT", "THEATER", "LESUNG", "COMEDY", "SONSTIGES"];

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
            ticketUrl: e.ticketUrl || "",
            price: e.price || "",
            tagsInput: (e.tags || []).join(", "),
            community: (e as any).community || "",
          });
          setProfileLoaded(true);
          if ((e as any).isPromoted) setAlreadyPromoted(true);
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
      ticketUrl: form.ticketUrl || undefined,
      price: form.price || undefined,
      tags,
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
          <Label>Bild-URL (optional)</Label>
          <Input type="url" placeholder="https://…" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
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
