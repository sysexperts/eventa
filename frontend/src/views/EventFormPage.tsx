import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Input, Textarea, Button, Label } from "../ui/components";

const CATEGORIES = ["KONZERT", "THEATER", "LESUNG", "COMEDY", "SONSTIGES"];

type Props = { mode: "create" | "edit" };

export function EventFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
          });
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

    const { tagsInput, ...rest } = form;
    const payload = {
      ...rest,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      imageUrl: form.imageUrl || undefined,
      ticketUrl: form.ticketUrl || undefined,
      price: form.price || undefined,
      tags,
    };

    try {
      if (mode === "create") {
        await api.events.create(payload);
      } else if (id) {
        await api.events.update(id, payload);
      }
      navigate("/dashboard");
    } catch {
      setError("Speichern fehlgeschlagen. Bitte prüfe die Eingaben.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">
        {mode === "create" ? "Neues Event erstellen" : "Event bearbeiten"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
