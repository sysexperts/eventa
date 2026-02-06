import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, Artist, ArtistReview, EventListItem } from "../lib/api";
import { useAuth } from "../state/auth";
import { Button, Textarea } from "../ui/components";

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`text-lg transition ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} ${
            star <= (hover || rating) ? "text-amber-400" : "text-zinc-600"
          }`}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function SocialLink({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm font-medium transition hover:bg-white/[0.06] ${color}`}
    >
      {label}
    </a>
  );
}

function SpotifyEmbed({ url }: { url: string }) {
  // Convert spotify link to embed URL
  // Supports: open.spotify.com/artist/ID, open.spotify.com/track/ID, open.spotify.com/album/ID
  const match = url.match(/open\.spotify\.com\/(artist|track|album)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  const [, type, id] = match;
  return (
    <iframe
      src={`https://open.spotify.com/embed/${type}/${id}?theme=0`}
      width="100%"
      height={type === "artist" ? 452 : 152}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-xl"
    />
  );
}


function YouTubeEmbed({ url }: { url: string }) {
  // Extract video ID from various YouTube URL formats
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return (
    <iframe
      src={`https://www.youtube.com/embed/${match[1]}`}
      width="100%"
      height="315"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
      className="rounded-xl"
    />
  );
}

export function ArtistProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [reviews, setReviews] = useState<ArtistReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  // Review form
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await api.artists.get(slug);
        const a = res.artist as any;
        setArtist(a);
        setEvents(a.events || []);
        setReviews(a.reviews || []);
        setFollowerCount(a.followerCount || 0);
        setAvgRating(a.avgRating || 0);

        // Check existing review by current user
        if (user && a.reviews) {
          const myReview = a.reviews.find((r: ArtistReview) => r.user.id === user.id);
          if (myReview) {
            setMyRating(myReview.rating);
            setMyComment(myReview.comment);
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [slug, user]);

  useEffect(() => {
    if (!slug || !user) return;
    api.artists.followStatus(slug).then((res) => setFollowing(res.following)).catch(() => {});
  }, [slug, user]);

  async function handleFollow() {
    if (!slug || !user) return;
    setFollowBusy(true);
    try {
      const res = await api.artists.toggleFollow(slug);
      setFollowing(res.following);
      setFollowerCount(res.followerCount);
    } catch { /* ignore */ }
    setFollowBusy(false);
  }

  async function handleReview() {
    if (!slug || !user || myRating === 0) return;
    setReviewBusy(true);
    try {
      const res = await api.artists.addReview(slug, { rating: myRating, comment: myComment });
      // Update reviews list
      setReviews((prev: any) => {
        const filtered = prev.filter((r: any) => r.user.id !== user.id);
        return [res.review, ...filtered];
      });
      // Recalculate avg
      const allRatings = reviews.filter((r: any) => r.user.id !== user.id).map((r: any) => r.rating);
      allRatings.push(res.review.rating);
      setAvgRating(Math.round((allRatings.reduce((s: number, r: number) => s + r, 0) / allRatings.length) * 10) / 10);
    } catch { /* ignore */ }
    setReviewBusy(false);
  }

  async function handleDeleteReview() {
    if (!slug || !user) return;
    setReviewBusy(true);
    try {
      await api.artists.deleteReview(slug);
      setReviews((prev: any) => prev.filter((r: any) => r.user.id !== user.id));
      setMyRating(0);
      setMyComment("");
    } catch { /* ignore */ }
    setReviewBusy(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>;
  if (!artist) return <div className="py-20 text-center text-surface-500">Künstler nicht gefunden.</div>;

  const socialLinks: { href: string; label: string; color: string }[] = [];
  if (artist.spotify) socialLinks.push({ href: artist.spotify, label: "Spotify", color: "text-green-400" });
  if (artist.instagram) socialLinks.push({ href: `https://instagram.com/${artist.instagram.replace("@", "")}`, label: "Instagram", color: "text-pink-400" });
  if (artist.youtube) socialLinks.push({ href: artist.youtube, label: "YouTube", color: "text-red-400" });
  if (artist.tiktok) socialLinks.push({ href: `https://tiktok.com/@${artist.tiktok.replace("@", "")}`, label: "TikTok", color: "text-cyan-400" });
  if (artist.facebook) socialLinks.push({ href: artist.facebook, label: "Facebook", color: "text-blue-400" });
  if (artist.soundcloud) socialLinks.push({ href: artist.soundcloud, label: "SoundCloud", color: "text-orange-400" });
  if (artist.bandcamp) socialLinks.push({ href: artist.bandcamp, label: "Bandcamp", color: "text-teal-400" });
  if (artist.website) socialLinks.push({ href: artist.website, label: "Website", color: "text-surface-300" });

  const upcomingEvents = events.filter((e: any) => new Date(e.startsAt) >= new Date());
  const pastEvents = events.filter((e: any) => new Date(e.startsAt) < new Date());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.06]">
        {/* Background: header image or gradient */}
        {artist.headerImageUrl ? (
          <img src={artist.headerImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div className={`absolute inset-0 ${artist.headerImageUrl ? "bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-zinc-900/30" : "bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"}`} />

        {/* Content overlay – Spotify-style: name bottom-left, stats + follow in one row */}
        <div className="relative z-10 px-6 pt-40 sm:pt-52 pb-6 flex flex-col justify-end">
          {/* Artist name + avatar */}
          <div className="flex items-end gap-4 mb-4">
            {artist.imageUrl ? (
              <img src={artist.imageUrl} alt={artist.name} className="h-24 w-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl flex-shrink-0" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-500/20 border-2 border-white/20 shadow-xl flex-shrink-0">
                <span className="text-3xl font-bold text-indigo-400">{artist.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg leading-tight">{artist.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {artist.genre && <span className="rounded-full bg-black/30 backdrop-blur-sm px-3 py-0.5 text-xs font-medium text-indigo-300">{artist.genre}</span>}
                {artist.hometown && <span className="text-sm text-white/70 drop-shadow">{artist.hometown}</span>}
              </div>
            </div>
          </div>

          {/* Stats row + Follow button – same line */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white drop-shadow">{followerCount}</span>
                <span className="text-xs text-white/60">Follower</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white drop-shadow">{events.length}</span>
                <span className="text-xs text-white/60">Events</span>
              </div>
              {avgRating > 0 && (
                <>
                  <div className="h-4 w-px bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 drop-shadow">★</span>
                    <span className="text-lg font-bold text-white drop-shadow">{avgRating}</span>
                    <span className="text-xs text-white/60">({reviews.length})</span>
                  </div>
                </>
              )}
            </div>

            {user && (
              <Button
                onClick={handleFollow}
                disabled={followBusy}
                variant={following ? "ghost" : undefined}
                className={following ? "border-indigo-500/30 text-indigo-400" : ""}
              >
                {followBusy ? "..." : following ? "Folge ich" : "Folgen"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {artist.tags && artist.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {artist.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">{tag}</span>
          ))}
        </div>
      )}

      {/* Bio + Press Quote */}
      {(artist.bio || artist.pressQuote) && (
        <div className="mb-8 space-y-4">
          {artist.bio && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="mb-2 text-sm font-semibold text-surface-400 uppercase tracking-wider">Über</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-surface-300">{artist.bio}</p>
            </div>
          )}
          {artist.pressQuote && (
            <blockquote className="rounded-xl border-l-4 border-indigo-500/40 bg-indigo-500/5 px-5 py-4">
              <p className="text-sm italic text-surface-300">"{artist.pressQuote}"</p>
            </blockquote>
          )}
        </div>
      )}

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-surface-400 uppercase tracking-wider">Links</h2>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <SocialLink key={link.label} {...link} />
            ))}
          </div>
        </div>
      )}

      {/* Spotify Embed (Artist-Embed zeigt automatisch Top Songs) */}
      {artist.spotify && artist.spotify.includes("open.spotify.com") && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-surface-400 uppercase tracking-wider">Musik & Top Songs</h2>
          <SpotifyEmbed url={artist.spotify} />
        </div>
      )}

      {/* YouTube Embed */}
      {artist.youtube && (artist.youtube.includes("youtube.com") || artist.youtube.includes("youtu.be")) && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-surface-400 uppercase tracking-wider">Video</h2>
          <YouTubeEmbed url={artist.youtube} />
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-surface-400 uppercase tracking-wider">Kommende Events</h2>
          <div className="space-y-2">
            {upcomingEvents.map((ev: any) => (
              <Link key={ev.id} to={`/events/${ev.id}`} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition">
                {ev.imageUrl && <img src={ev.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{ev.title}</div>
                  <div className="text-xs text-surface-500">
                    {new Date(ev.startsAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                    {ev.city && ` · ${ev.city}`}
                  </div>
                </div>
                {ev.isPromoted && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">Promoted</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-surface-400 uppercase tracking-wider">Vergangene Events</h2>
          <div className="space-y-2">
            {pastEvents.slice(0, 5).map((ev: any) => (
              <Link key={ev.id} to={`/events/${ev.id}`} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition opacity-60">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-300 truncate">{ev.title}</div>
                  <div className="text-xs text-surface-600">
                    {new Date(ev.startsAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                    {ev.city && ` · ${ev.city}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-surface-400 uppercase tracking-wider">
          Bewertungen {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {/* Write review form */}
        {user ? (
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">Deine Bewertung</h3>
            <div className="flex items-center gap-3 mb-3">
              <StarRating rating={myRating} onRate={setMyRating} interactive />
              {myRating > 0 && <span className="text-xs text-surface-500">{myRating} von 5 Sternen</span>}
            </div>
            <Textarea
              value={myComment}
              onChange={(e: any) => setMyComment(e.target.value)}
              placeholder="Schreibe einen Kommentar (optional)..."
              rows={3}
              className="mb-3"
            />
            <div className="flex gap-2">
              <Button onClick={handleReview} disabled={reviewBusy || myRating === 0}>
                {reviewBusy ? "Speichere..." : "Bewertung abgeben"}
              </Button>
              {reviews.some((r) => r.user.id === user.id) && (
                <Button variant="ghost" onClick={handleDeleteReview} disabled={reviewBusy}>
                  <span className="text-red-400">Löschen</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
            <p className="text-sm text-surface-500">
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Melde dich an</Link>, um eine Bewertung abzugeben.
            </p>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10">
                      <span className="text-xs font-bold text-indigo-400">{review.user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{review.user.name}</div>
                      <div className="text-[10px] text-surface-600">
                        {new Date(review.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && <p className="text-sm text-surface-400 mt-1">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-600">Noch keine Bewertungen.</p>
        )}
      </div>
    </div>
  );
}
