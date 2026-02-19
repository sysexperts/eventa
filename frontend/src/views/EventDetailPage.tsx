import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type EventDetail, type SimilarEvent, type User, type EventComment, type EventAttendance } from "../lib/api";
import { categoryLabel, formatDateTime, formatDate } from "../lib/format";
import { FavoriteButton } from "../ui/FavoriteButton";

function Countdown({ date }: { date: string }) {
  const [diff, setDiff] = useState(() => new Date(date).getTime() - Date.now());

  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(date).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [date]);

  if (diff <= 0) return <span className="text-sm font-semibold text-neon-green">Läuft jetzt!</span>;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-2 text-center">
      {days > 0 && (
        <div className="flex-1 rounded-xl bg-white/5 px-3 py-3 border border-white/[0.06]">
          <div className="text-xl font-bold text-white">{days}</div>
          <div className="text-[10px] uppercase tracking-wider text-surface-500">Tage</div>
        </div>
      )}
      <div className="flex-1 rounded-xl bg-white/5 px-3 py-3 border border-white/[0.06]">
        <div className="text-xl font-bold text-white">{hours}</div>
        <div className="text-[10px] uppercase tracking-wider text-surface-500">Std</div>
      </div>
      <div className="flex-1 rounded-xl bg-white/5 px-3 py-3 border border-white/[0.06]">
        <div className="text-xl font-bold text-white">{mins}</div>
        <div className="text-[10px] uppercase tracking-wider text-surface-500">Min</div>
      </div>
      <div className="flex-1 rounded-xl bg-white/5 px-3 py-3 border border-white/[0.06]">
        <div className="text-xl font-bold text-accent-400">{secs}</div>
        <div className="text-[10px] uppercase tracking-wider text-surface-500">Sek</div>
      </div>
    </div>
  );
}

function ShareButtons({ title, url }: { title: string; url: string }) {
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`https://wa.me/?text=${text}%20${link}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-surface-300 transition-all hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/20">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.624-1.467A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.587-5.932-1.61l-.425-.253-2.744.87.882-2.68-.278-.44A9.77 9.77 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12s-4.395 9.818-9.818 9.818z"/></svg>
        WhatsApp
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${text}&url=${link}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-surface-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20">
        <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${link}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-surface-300 transition-all hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/20">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook
      </a>
      <a href={`mailto:?subject=${text}&body=${text}%20-%20${link}`} className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-surface-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        E-Mail
      </a>
      <button onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-surface-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        {copied ? "Kopiert!" : "Link kopieren"}
      </button>
    </div>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-surface-400">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">{label}</span>
      </div>
      {children}
    </div>
  );
}

const REPORT_REASONS = [
  "Falsche oder irreführende Informationen",
  "Veranstaltung findet nicht statt",
  "Spam oder Werbung",
  "Anstößiger oder illegaler Inhalt",
  "Urheberrechtsverletzung",
  "Sonstiges",
];

function ReportButton({ eventTitle, eventId }: { eventTitle: string; eventId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    const subject = encodeURIComponent(`Event melden: ${eventTitle}`);
    const body = encodeURIComponent(
      `Event-ID: ${eventId}\nEvent: ${eventTitle}\n\nGrund: ${reason}\n\nDetails:\n${details}\n\nURL: ${window.location.href}`
    );
    window.location.href = `mailto:melden@localevents.de?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setReason(""); setDetails(""); }, 2000);
  }

  return (
    <>
      <div className="border-t border-white/[0.06] pt-6">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-xs text-surface-500 hover:text-red-400 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Event melden
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-white">Event melden</h3>
            <p className="mt-1 text-xs text-surface-400">
              Bitte wähle einen Grund und beschreibe das Problem kurz.
            </p>

            <div className="mt-4 space-y-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-left text-xs transition-all ${
                    reason === r
                      ? "border-red-500/40 bg-red-500/10 text-red-300"
                      : "border-white/[0.06] bg-white/[0.03] text-surface-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Weitere Details (optional)..."
              rows={3}
              className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white placeholder-surface-500 outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSend}
                disabled={!reason || sent}
                className="flex-1 rounded-xl bg-red-500/80 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sent ? "Gesendet ✓" : "Melden"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-surface-300 transition hover:bg-white/10"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [similar, setSimilar] = useState<SimilarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Attendance state
  const [attendance, setAttendance] = useState<EventAttendance | null>(null);
  const [togglingAttend, setTogglingAttend] = useState(false);

  // Comments state
  const [comments, setComments] = useState<EventComment[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadComments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.comments.list(id);
      setComments(res.comments);
      setCommentsTotal(res.total);
    } catch { /* ignore */ }
  }, [id]);

  const loadAttendance = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.attendance.get(id);
      setAttendance(res);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.events.get(id);
        setEvent(res.event);
        setSimilar(res.similar);
        // Track page view
        api.events.trackView(id).catch(() => {});
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    })();
    loadComments();
    loadAttendance();
  }, [id, loadComments, loadAttendance]);

  useEffect(() => {
    api.me.get().then((r) => {
      setUser(r.user);
      if (id) api.events.favoriteIds().then((f) => setIsFavorited(f.ids.includes(id))).catch(() => {});
    }).catch(() => {});
  }, [id]);

  async function handleToggleAttend() {
    if (!id || togglingAttend) return;
    setTogglingAttend(true);
    try {
      const res = await api.attendance.toggle(id);
      setAttendance((prev) => prev ? { ...prev, attending: res.attending, count: res.count } : prev);
      await loadAttendance();
    } catch { /* ignore */ }
    setTogglingAttend(false);
  }

  async function handlePostComment(parentId?: string) {
    if (!id) return;
    const text = parentId ? replyText.trim() : newComment.trim();
    if (!text) return;
    setPostingComment(true);
    try {
      await api.comments.create(id, { text, parentId });
      if (parentId) { setReplyText(""); setReplyTo(null); } else { setNewComment(""); }
      await loadComments();
    } catch { /* ignore */ }
    setPostingComment(false);
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Kommentar wirklich löschen?")) return;
    try {
      await api.comments.remove(commentId);
      await loadComments();
    } catch { /* ignore */ }
  }

  async function handleToggleFeatured() {
    if (!event || togglingFeatured) return;
    setTogglingFeatured(true);
    try {
      const res = await api.events.toggleFeatured(event.id);
      setEvent({ ...event, isFeatured: res.isFeatured });
    } catch { /* ignore */ }
    setTogglingFeatured(false);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-700 border-t-accent-500" />
      <p className="mt-4 text-sm text-surface-500">Event wird geladen…</p>
    </div>
  );

  if (!event) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">😕</div>
      <p className="mt-4 text-base font-medium text-surface-300">Event nicht gefunden</p>
      <Link to="/events" className="mt-4 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors">
        ← Zurück zu allen Events
      </Link>
    </div>
  );

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.address}, ${event.city}, ${event.country}`)}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div>
      {/* Hero Section - Full bleed */}
      <div className="relative">
        {/* Hero Image */}
        <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden sm:h-[60vh]">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-accent-900 via-surface-900 to-neon-purple/20" />
          )}
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/60 to-surface-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950/40 to-transparent" />
        </div>

        {/* Content over hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            {/* Back button */}
            <Link
              to="/events"
              className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Zurück
            </Link>

            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {categoryLabel(event.category)}
              </span>
              {event.isFeatured && (
                <span className="rounded-full bg-neon-green/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-950">
                  Featured
                </span>
              )}
              {event.price && (
                <span className="rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-300 backdrop-blur-sm">
                  {event.price}
                </span>
              )}
              <FavoriteButton eventId={event.id} isFavorited={isFavorited} onToggle={(_id, fav) => setIsFavorited(fav)} />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>

            {/* Admin / Owner: Edit button */}
            {(user?.isAdmin || user?.id === event.organizer.id) && (
              <Link
                to={`/dashboard/events/${event.id}/edit`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-surface-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Bearbeiten
              </Link>
            )}

            {/* Quick info */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-surface-300">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {formatDateTime(event.startsAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {event.city}, {event.country}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {event.organizer.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-medium text-surface-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Artists */}
            {(event as any).artists?.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-white">Künstler</h2>
                <div className="flex flex-wrap gap-3">
                  {(event as any).artists.map((a: any) => (
                    <Link key={a.id} to={`/artists/${a.slug}`} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition">
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.name} className="h-12 w-12 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          <span className="text-sm font-bold text-indigo-400">{a.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">{a.name}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {a.genre && <span className="text-xs text-surface-500">{a.genre}</span>}
                          {a.genre && a.hometown && <span className="text-xs text-surface-600">·</span>}
                          {a.hometown && <span className="text-xs text-surface-500">{a.hometown}</span>}
                        </div>
                        {(a.spotify || a.instagram || a.youtube || a.website) && (
                          <div className="flex items-center gap-2 mt-1">
                            {a.spotify && <a href={a.spotify} target="_blank" rel="noopener noreferrer" className="text-[11px] text-green-400 hover:text-green-300">Spotify</a>}
                            {a.instagram && <a href={`https://instagram.com/${a.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-pink-400 hover:text-pink-300">Instagram</a>}
                            {a.youtube && <a href={a.youtube} target="_blank" rel="noopener noreferrer" className="text-[11px] text-red-400 hover:text-red-300">YouTube</a>}
                            {a.website && <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-surface-400 hover:text-white">Web</a>}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-white">Über dieses Event</h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-surface-400">{event.description}</div>
            </div>

            {/* Share */}
            <div className="border-t border-white/[0.06] pt-8">
              <h2 className="mb-4 text-lg font-bold text-white">Event teilen</h2>
              <ShareButtons title={event.title} url={shareUrl} />
            </div>

            {/* Report */}
            <ReportButton eventTitle={event.title} eventId={event.id} />

            {/* Comments */}
            <div className="border-t border-white/[0.06] pt-8">
              <h2 className="mb-6 text-lg font-bold text-white">
                Diskussion {commentsTotal > 0 && <span className="ml-1 text-sm font-normal text-surface-500">({commentsTotal})</span>}
              </h2>

              {/* New comment form */}
              {user ? (
                <div className="mb-6">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-xs font-bold text-accent-400">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e: any) => setNewComment(e.target.value)}
                        placeholder="Schreibe einen Kommentar..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-accent-500/20"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handlePostComment()}
                          disabled={postingComment || !newComment.trim()}
                          className="rounded-lg bg-accent-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-400 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {postingComment ? "..." : "Kommentieren"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mb-6 text-sm text-surface-500">Melde dich an, um zu kommentieren.</p>
              )}

              {/* Comment list */}
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500/10 text-xs font-bold text-accent-400">
                        {c.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">{c.user.name}</span>
                        <span className="ml-2 text-[11px] text-surface-600">{new Date(c.createdAt).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {user && (user.id === c.user.id || user.isAdmin) && (
                        <button onClick={() => handleDeleteComment(c.id)} className="ml-auto text-xs text-surface-600 hover:text-red-400 transition-colors">
                          Löschen
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-surface-300 leading-relaxed">{c.text}</p>

                    {/* Reply button */}
                    {user && (
                      <button
                        onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText(""); }}
                        className="mt-2 text-xs text-surface-500 hover:text-accent-400 transition-colors"
                      >
                        Antworten
                      </button>
                    )}

                    {/* Reply form */}
                    {replyTo === c.id && (
                      <div className="mt-3 ml-10 flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={(e: any) => setReplyText(e.target.value)}
                          placeholder="Antwort schreiben..."
                          rows={2}
                          className="flex-1 resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-surface-500 outline-none focus:border-accent-500/40"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handlePostComment(c.id)}
                            disabled={postingComment || !replyText.trim()}
                            className="rounded-lg bg-accent-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-accent-400 disabled:opacity-40"
                          >
                            Senden
                          </button>
                          <button onClick={() => setReplyTo(null)} className="text-[11px] text-surface-500 hover:text-white">
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-3 ml-10 space-y-3 border-l-2 border-white/[0.06] pl-4">
                        {c.replies.map((r) => (
                          <div key={r.id}>
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-surface-400">
                                {r.user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-white">{r.user.name}</span>
                              <span className="text-[10px] text-surface-600">{new Date(r.createdAt).toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                              {user && (user.id === r.user.id || user.isAdmin) && (
                                <button onClick={() => handleDeleteComment(r.id)} className="ml-auto text-[10px] text-surface-600 hover:text-red-400">Löschen</button>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-surface-400 leading-relaxed">{r.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-center text-sm text-surface-600 py-8">Noch keine Kommentare. Sei der Erste!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Ticket CTA */}
            {event.ticketUrl && (
              <div className="relative overflow-hidden rounded-2xl border border-accent-500/20 bg-gradient-to-br from-accent-500/10 to-accent-600/5 p-6">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-500/10 blur-2xl" />
                <div className="relative">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-400">Tickets sichern</div>
                  {event.price && <div className="mb-4 text-3xl font-extrabold text-white">{event.price}</div>}
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => api.events.trackTicketClick(event.id).catch(() => {})}
                    className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400 hover:shadow-accent-500/40"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                    Tickets kaufen
                  </a>
                  <p className="mt-2 text-center text-[10px] text-surface-500">Weiterleitung zur externen Ticketseite</p>
                </div>
              </div>
            )}

            {/* Countdown */}
            <InfoCard
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label="Countdown"
            >
              <Countdown date={event.startsAt} />
            </InfoCard>

            {/* Date & Time */}
            <InfoCard
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              label="Datum & Uhrzeit"
            >
              <div className="text-sm font-medium text-white">{formatDateTime(event.startsAt)}</div>
              {event.endsAt && <div className="mt-0.5 text-sm text-surface-500">bis {formatDateTime(event.endsAt)}</div>}
            </InfoCard>

            {/* Location */}
            <InfoCard
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
              label="Veranstaltungsort"
            >
              <div className="text-sm font-medium text-white">{event.address}</div>
              <div className="mt-0.5 text-sm text-surface-500">{event.city}, {event.country}</div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-400 transition-colors hover:text-accent-300"
              >
                In Google Maps öffnen
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </InfoCard>

            {/* Admin: Featured Toggle */}
            {user?.isAdmin && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-surface-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Admin</span>
                </div>
                <button
                  onClick={handleToggleFeatured}
                  disabled={togglingFeatured}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    event.isFeatured
                      ? "bg-neon-green/15 border border-neon-green/30 text-neon-green hover:bg-neon-green/25"
                      : "bg-white/5 border border-white/10 text-surface-400 hover:bg-white/10 hover:text-white"
                  } disabled:opacity-50`}
                >
                  {togglingFeatured ? "..." : event.isFeatured ? "★ Featured (aktiv)" : "☆ Als Featured markieren"}
                </button>
              </div>
            )}

            {/* Ich gehe hin */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-surface-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Teilnehmer</span>
              </div>
              <div className="mb-3 text-center">
                <div className="text-3xl font-extrabold text-white">{attendance?.count ?? 0}</div>
                <div className="text-xs text-surface-500">Personen nehmen teil</div>
              </div>
              {user && (
                <button
                  onClick={handleToggleAttend}
                  disabled={togglingAttend}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${
                    attendance?.attending
                      ? "bg-neon-green/15 border border-neon-green/30 text-neon-green hover:bg-neon-green/25"
                      : "bg-accent-500/15 border border-accent-500/30 text-accent-400 hover:bg-accent-500/25"
                  }`}
                >
                  {togglingAttend ? "..." : attendance?.attending ? "✓ Ich bin dabei!" : "Ich gehe hin"}
                </button>
              )}
              {attendance && attendance.attendees && attendance.attendees.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {attendance.attendees.slice(0, 8).map((a, i) => (
                    <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/10 text-[10px] font-bold text-accent-400" title={a.user.name}>
                      {a.user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {attendance.count > 8 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[10px] font-medium text-surface-500">
                      +{attendance.count - 8}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Organizer */}
            <InfoCard
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              label="Veranstalter"
            >
              <div className="text-sm font-medium text-white">{event.organizer.name}</div>
              {event.organizer.website && (
                <a
                  href={event.organizer.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-accent-400 transition-colors hover:text-accent-300"
                >
                  {event.organizer.website.replace(/^https?:\/\//, "")}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}
            </InfoCard>
          </div>
        </div>
      </div>

      {/* Similar Events */}
      {similar.length > 0 && (
        <section className="border-t border-white/[0.06] bg-white/[0.01]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-white">Ähnliche Events</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/events/${ev.id}`}
                  className="group flex gap-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06]"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    {ev.imageUrl ? (
                      <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-900/50 to-surface-900 text-xl">🎉</div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center py-0.5">
                    <div className="text-[11px] font-medium text-surface-500">
                      {categoryLabel(ev.category)} · {formatDate(ev.startsAt)}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-white group-hover:text-accent-300 transition-colors">{ev.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-surface-500">
                      <span>{ev.city}</span>
                      {ev.price && <><span className="h-0.5 w-0.5 rounded-full bg-surface-600" /><span className="font-medium text-accent-400">{ev.price}</span></>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky bottom ticket bar (mobile) */}
      {event.ticketUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.08] bg-surface-950/95 backdrop-blur-xl p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">{event.title}</div>
              {event.price && <div className="text-xs text-surface-400">{event.price}</div>}
            </div>
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => api.events.trackTicketClick(event.id).catch(() => {})}
              className="shrink-0 rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25"
            >
              Tickets
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
