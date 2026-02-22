import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, Artist } from "../lib/api";
import { Input, Textarea, Button, Label } from "../ui/components";

export function ArtistsAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const emptyForm = { name: "", bio: "", imageUrl: "", headerImageUrl: "", genre: "", hometown: "", tagsInput: "", website: "", instagram: "", spotify: "", youtube: "", tiktok: "", facebook: "", soundcloud: "", bandcamp: "", pressQuote: "" };
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.artists.list();
      setArtists(res.artists);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreate(true);
      setEditingId(null);
      setForm(emptyForm);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  function set(key: string, value: string) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(file: File, field: "imageUrl" | "headerImageUrl" = "imageUrl") {
    setUploading(true);
    try {
      const res = await api.artists.uploadImage(file);
      set(field, res.imageUrl);
    } catch {
      setError("Bild-Upload fehlgeschlagen.");
    }
    setUploading(false);
  }

  function startEdit(a: Artist) {
    setEditingId(a.id);
    setShowCreate(false);
    setForm({
      name: a.name,
      bio: a.bio || "",
      imageUrl: a.imageUrl || "",
      headerImageUrl: a.headerImageUrl || "",
      genre: a.genre || "",
      hometown: a.hometown || "",
      tagsInput: (a.tags || []).join(", "),
      website: a.website || "",
      instagram: a.instagram || "",
      spotify: a.spotify || "",
      youtube: a.youtube || "",
      tiktok: a.tiktok || "",
      facebook: a.facebook || "",
      soundcloud: a.soundcloud || "",
      bandcamp: a.bandcamp || "",
      pressQuote: a.pressQuote || "",
    });
    setError("");
  }

  function startCreate() {
    setEditingId(null);
    setShowCreate(true);
    setForm(emptyForm);
    setError("");
  }

  function cancel() {
    setEditingId(null);
    setShowCreate(false);
    setForm(emptyForm);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Name ist erforderlich."); return; }
    setBusy(true);
    setError("");
    const { tagsInput, ...rest } = form;
    const payload = { ...rest, tags: tagsInput.split(",").map((t: string) => t.trim()).filter(Boolean) };
    try {
      if (showCreate) {
        await api.artists.create(payload);
      } else if (editingId) {
        await api.artists.update(editingId, payload);
      }
      cancel();
      await load();
    } catch {
      setError("Speichern fehlgeschlagen.");
    }
    setBusy(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Künstler wirklich löschen?")) return;
    try {
      await api.artists.remove(id);
      if (editingId === id) cancel();
      await load();
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-zinc-400">Lade Künstler...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Künstler verwalten</h1>
          <p className="mt-1 text-sm text-surface-500">{artists.length} Künstler insgesamt</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent-500/20 transition-all hover:bg-accent-400 hover:shadow-accent-500/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neuer Künstler
        </button>
      </div>

      {/* Create / Edit Form */}
      {(showCreate || editingId) && (
        <div className="mb-8 rounded-2xl border border-accent-500/20 bg-surface-900/80 shadow-xl shadow-accent-500/5 overflow-hidden">
          {/* Form header */}
          <div className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent-400">
                  {showCreate ? <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></> : <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}
                </svg>
              </div>
              <h2 className="text-base font-bold text-white">
                {showCreate ? "Neuen Künstler anlegen" : "Künstler bearbeiten"}
              </h2>
            </div>
            <button onClick={cancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-500 transition hover:bg-white/5 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Section: Basis-Infos */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Basis-Informationen</h3>
              <div className="h-px bg-white/[0.04]" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e: any) => set("name", e.target.value)} placeholder="z.B. Max Müller" />
              </div>
              <div>
                <Label>Genre</Label>
                <Input value={form.genre} onChange={(e: any) => set("genre", e.target.value)} placeholder="z.B. Rock, Jazz, Comedy" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Herkunft</Label>
                <Input value={form.hometown} onChange={(e: any) => set("hometown", e.target.value)} placeholder="z.B. Berlin, DE" />
              </div>
              <div>
                <Label>Tags (kommagetrennt)</Label>
                <Input value={form.tagsInput} onChange={(e: any) => set("tagsInput", e.target.value)} placeholder="Indie-Rock, Deutschpop, Live-Band" />
              </div>
            </div>

            <div>
              <Label>Biografie</Label>
              <Textarea value={form.bio} onChange={(e: any) => set("bio", e.target.value)} placeholder="Kurze Beschreibung des Künstlers..." rows={3} />
            </div>

            <div>
              <Label>Pressezitat</Label>
              <Input value={form.pressQuote} onChange={(e: any) => set("pressQuote", e.target.value)} placeholder='z.B. "Einer der besten Live-Acts..." – Musikmagazin' />
            </div>

            {/* Section: Bilder */}
            <div className="space-y-1 pt-2">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Bilder</h3>
              <div className="h-px bg-white/[0.04]" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Künstlerbild */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Label>Künstlerbild</Label>
                <div className="mt-2 flex items-center gap-4">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Vorschau" className="h-20 w-20 rounded-xl object-cover border border-white/10 shadow-lg" onError={(e: any) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-surface-700 bg-surface-800/50">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-600"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 px-3 py-1.5 text-xs font-semibold text-accent-400 hover:bg-accent-500/20 transition">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      {uploading ? "Lade hoch..." : "Hochladen"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploading} onChange={(e: any) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                    </label>
                    {form.imageUrl && (
                      <button type="button" onClick={() => set("imageUrl", "")} className="text-[11px] text-red-400 hover:text-red-300 text-left">Entfernen</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Header-Bild */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Label>Header-Bild (Banner)</Label>
                <div className="mt-2 flex items-center gap-4">
                  {form.headerImageUrl ? (
                    <img src={form.headerImageUrl} alt="Header" className="h-16 w-32 rounded-lg object-cover border border-white/10 shadow-lg" onError={(e: any) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-dashed border-surface-700 bg-surface-800/50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-600"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="m22 11-5-3-5 5-3-2-7 5"/></svg>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 text-xs font-semibold text-purple-400 hover:bg-purple-500/20 transition">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      {uploading ? "Lade hoch..." : "Hochladen"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploading} onChange={(e: any) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, "headerImageUrl"); }} />
                    </label>
                    {form.headerImageUrl && (
                      <button type="button" onClick={() => set("headerImageUrl", "")} className="text-[11px] text-red-400 hover:text-red-300 text-left">Entfernen</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Social Media */}
            <div className="space-y-1 pt-2">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Social Media & Links</h3>
              <div className="h-px bg-white/[0.04]" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Website</Label>
                <Input value={form.website} onChange={(e: any) => set("website", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input value={form.instagram} onChange={(e: any) => set("instagram", e.target.value)} placeholder="@benutzername" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Spotify</Label>
                <Input value={form.spotify} onChange={(e: any) => set("spotify", e.target.value)} placeholder="Spotify-Link" />
              </div>
              <div>
                <Label>YouTube</Label>
                <Input value={form.youtube} onChange={(e: any) => set("youtube", e.target.value)} placeholder="YouTube-Kanal oder Video" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>TikTok</Label>
                <Input value={form.tiktok} onChange={(e: any) => set("tiktok", e.target.value)} placeholder="@benutzername" />
              </div>
              <div>
                <Label>Facebook</Label>
                <Input value={form.facebook} onChange={(e: any) => set("facebook", e.target.value)} placeholder="Facebook-Seite" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>SoundCloud</Label>
                <Input value={form.soundcloud} onChange={(e: any) => set("soundcloud", e.target.value)} placeholder="SoundCloud-Profil" />
              </div>
              <div>
                <Label>Bandcamp</Label>
                <Input value={form.bandcamp} onChange={(e: any) => set("bandcamp", e.target.value)} placeholder="Bandcamp-Link" />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent-500/20 transition-all hover:bg-accent-400 disabled:opacity-50"
              >
                {busy ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {busy ? "Speichere..." : showCreate ? "Anlegen" : "Speichern"}
              </button>
              <button onClick={cancel} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-surface-400 transition hover:bg-white/[0.06] hover:text-white">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artists List */}
      {artists.length === 0 && !showCreate ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white/5 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <p className="text-base font-semibold text-surface-300">Noch keine Künstler angelegt</p>
          <p className="text-sm text-surface-500 mt-1">Klicke auf "Neuer Künstler" um den ersten anzulegen.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((a) => (
            <div
              key={a.id}
              className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/5 ${
                editingId === a.id ? "border-accent-500/40 shadow-lg shadow-accent-500/10" : "border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {/* Header image or gradient */}
              <div className="relative h-24 overflow-hidden">
                {a.headerImageUrl ? (
                  <img src={a.headerImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : a.imageUrl ? (
                  <img src={a.imageUrl} alt="" className="h-full w-full object-cover blur-xl opacity-30 scale-125" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-accent-900/40 via-purple-900/30 to-surface-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent" />
              </div>

              {/* Avatar overlapping */}
              <div className="relative -mt-10 px-4">
                {a.imageUrl ? (
                  <img src={a.imageUrl} alt={a.name} className="h-16 w-16 rounded-xl object-cover border-2 border-surface-900 shadow-xl ring-2 ring-white/10" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent-500/20 border-2 border-surface-900 shadow-xl ring-2 ring-white/10">
                    <span className="text-xl font-black text-accent-400">{a.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-4 pt-3 pb-4">
                <h3 className="text-base font-bold text-white truncate">{a.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {a.genre && (
                    <span className="rounded-full bg-accent-500/10 border border-accent-500/20 px-2 py-0.5 text-[10px] font-semibold text-accent-300">{a.genre}</span>
                  )}
                  {a.hometown && (
                    <span className="text-[11px] text-surface-500">{a.hometown}</span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-3 text-[11px] text-surface-500">
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    {a._count?.events || 0} Events
                  </span>
                  <span className="text-surface-700">·</span>
                  <span className="font-mono text-surface-600">/{a.slug}</span>
                </div>

                {/* Social icons */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  {a.spotify && <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1DB954]/10 text-[#1DB954]" title="Spotify"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z"/></svg></span>}
                  {a.instagram && <span className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-500/10 text-pink-400" title="Instagram"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z"/></svg></span>}
                  {a.youtube && <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10 text-red-400" title="YouTube"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></span>}
                  {a.tiktok && <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-400" title="TikTok"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></span>}
                  {a.facebook && <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-400" title="Facebook"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></span>}
                  {a.website && <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-surface-400" title="Website"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg></span>}
                </div>

                {/* Tags */}
                {a.tags && a.tags.length > 0 && (
                  <div className="flex gap-1 mt-2.5 flex-wrap">
                    {a.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-surface-500">#{tag}</span>
                    ))}
                    {a.tags.length > 3 && <span className="text-[10px] text-surface-600">+{a.tags.length - 3}</span>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                  <Link to={`/artists/${a.slug}`} className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 text-center text-xs font-medium text-surface-300 transition hover:bg-white/[0.06] hover:text-white">
                    Profil
                  </Link>
                  <button onClick={() => startEdit(a)} className="flex-1 rounded-lg border border-accent-500/20 bg-accent-500/5 py-1.5 text-center text-xs font-medium text-accent-400 transition hover:bg-accent-500/10">
                    Bearbeiten
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="rounded-lg border border-red-500/10 bg-red-500/5 p-1.5 text-red-400 transition hover:bg-red-500/10" title="Löschen">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
