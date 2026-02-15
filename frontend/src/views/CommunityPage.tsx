import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type Community, type EventListItem, type CommunityMember, type CommunityInviteCode } from "../lib/api";
import { useAuth } from "../state/auth";
import { formatDate } from "../lib/format";

const FLAG_CDN = "https://hatscripts.github.io/circle-flags/flags";

function categoryLabel(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [membership, setMembership] = useState<{ id: string; role: string } | null>(null);
  const [inviteCodes, setInviteCodes] = useState<CommunityInviteCode[]>([]);
  const [tab, setTab] = useState<"events" | "members" | "about" | "admin">("events");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [membersTotal, setMembersTotal] = useState(0);

  const isAdmin = membership?.role === "ADMIN" || user?.isAdmin;
  const isMod = isAdmin || membership?.role === "MODERATOR";

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const [cRes, eRes, mRes] = await Promise.all([
        api.communities.get(slug),
        api.communities.events(slug),
        api.communities.members(slug),
      ]);
      setCommunity(cRes.community);
      setEvents(eRes.events);
      setEventsTotal(eRes.total);
      setMembers(mRes.members);
      setMembersTotal(mRes.total);

      if (user) {
        try {
          const msRes = await api.communities.myMembership(slug);
          setMembership(msRes.membership);
        } catch { setMembership(null); }

        // Load invite codes if admin
        try {
          const icRes = await api.communities.listInviteCodes(slug);
          setInviteCodes(icRes.codes);
        } catch { /* not admin */ }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => { load(); }, [load]);

  const handleJoin = async () => {
    if (!slug) return;
    setJoining(true);
    try {
      await api.communities.join(slug);
      await load();
    } catch (e: any) {
      alert(e?.body?.error || "Fehler beim Beitreten");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!slug || !confirm("Community wirklich verlassen?")) return;
    try {
      await api.communities.leave(slug);
      setMembership(null);
      await load();
    } catch (e: any) {
      alert(e?.body?.error || "Fehler");
    }
  };

  const handleCreateInvite = async () => {
    if (!slug) return;
    try {
      await api.communities.createInviteCode(slug, { label: "Einladung", expiresInDays: 30 });
      const icRes = await api.communities.listInviteCodes(slug);
      setInviteCodes(icRes.codes);
    } catch (e: any) {
      alert(e?.body?.error || "Fehler");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Community nicht gefunden</h1>
        <Link to="/events" className="mt-4 inline-block text-accent-400 hover:text-accent-300">← Zurück zu Events</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
        {community.bannerUrl ? (
          <img src={community.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : community.imageUrl ? (
          <img src={community.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent-600 via-purple-800 to-surface-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/50 to-transparent" />
      </div>

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-surface-950 bg-surface-800 shadow-xl">
            {community.imageUrl ? (
              <img src={community.imageUrl} alt={community.name} className="h-full w-full object-cover" />
            ) : community.country ? (
              <img src={`${FLAG_CDN}/${community.country.toLowerCase()}.svg`} alt="" className="h-full w-full object-cover p-4" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-surface-400">
                {community.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{community.name}</h1>
              {community.country && (
                <img src={`${FLAG_CDN}/${community.country.toLowerCase()}.svg`} alt="" className="h-6 w-6" />
              )}
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-surface-400">
              <span>{community._count?.members || 0} Mitglieder</span>
              <span>·</span>
              <span>{community._count?.events || 0} Events</span>
              {community.language && (
                <>
                  <span>·</span>
                  <span>{community.language}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            {user && !membership && (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400 disabled:opacity-50"
              >
                {joining ? "..." : "Beitreten"}
              </button>
            )}
            {membership && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neon-green/10 px-3 py-1 text-xs font-semibold text-neon-green">
                  {membership.role === "ADMIN" ? "Admin" : membership.role === "MODERATOR" ? "Moderator" : "Mitglied"}
                </span>
                {membership.role === "MEMBER" && (
                  <button onClick={handleLeave} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-surface-400 hover:bg-white/5 hover:text-white transition-all">
                    Verlassen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {community.description && (
          <p className="mt-4 max-w-3xl text-sm text-surface-400 leading-relaxed">{community.description}</p>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-white/[0.06]">
          {(["events", "members", "about", ...(isAdmin ? ["admin"] : [])] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                tab === t
                  ? "border-accent-500 text-white"
                  : "border-transparent text-surface-500 hover:text-white"
              }`}
            >
              {t === "events" ? `Events (${eventsTotal})` : t === "members" ? `Mitglieder (${membersTotal})` : t === "about" ? "Über" : "Verwaltung"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {tab === "events" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.length === 0 ? (
                <p className="col-span-full text-center text-surface-500 py-12">Noch keine Events in dieser Community.</p>
              ) : (
                events.map((ev) => (
                  <Link
                    key={ev.id}
                    to={`/events/${ev.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all hover:border-white/[0.12] hover:bg-white/[0.06]"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {ev.imageUrl ? (
                        <img src={ev.imageUrl} alt={ev.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-900/50 to-surface-900 text-3xl">🎉</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">{categoryLabel(ev.category)}</span>
                        {ev.isFeatured && <span className="rounded-full bg-neon-green/90 px-2 py-0.5 text-[10px] font-bold text-surface-950">Featured</span>}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white group-hover:text-accent-300 transition-colors line-clamp-1">{ev.title}</h3>
                      <p className="mt-1 text-xs text-surface-500">{formatDate(ev.startsAt)} · {ev.city}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {tab === "members" && (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10 text-sm font-bold text-accent-400">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{m.user.name}</p>
                      <p className="text-xs text-surface-500">Beigetreten {new Date(m.joinedAt).toLocaleDateString("de-DE")}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    m.role === "ADMIN" ? "bg-accent-500/10 text-accent-400" :
                    m.role === "MODERATOR" ? "bg-amber-500/10 text-amber-400" :
                    "bg-white/5 text-surface-500"
                  }`}>
                    {m.role === "ADMIN" ? "Admin" : m.role === "MODERATOR" ? "Moderator" : "Mitglied"}
                  </span>
                </div>
              ))}
              {members.length === 0 && <p className="text-center text-surface-500 py-12">Noch keine Mitglieder.</p>}
            </div>
          )}

          {tab === "about" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Über diese Community</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{community.description || "Keine Beschreibung vorhanden."}</p>
              </div>
              {community.members && community.members.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Team</h3>
                  <div className="space-y-2">
                    {community.members.map((m, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500/10 text-xs font-bold text-accent-400">
                          {m.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-white">{m.user.name}</span>
                        <span className="text-xs text-surface-500">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "admin" && isAdmin && (
            <div className="max-w-2xl space-y-8">
              {/* Invite Codes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Einladungscodes</h3>
                  <button
                    onClick={handleCreateInvite}
                    className="rounded-lg bg-accent-500 px-4 py-2 text-xs font-semibold text-white hover:bg-accent-400 transition-all"
                  >
                    + Neuer Code
                  </button>
                </div>
                <div className="space-y-2">
                  {inviteCodes.map((ic) => (
                    <div key={ic.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                      <div>
                        <code className="text-sm font-mono font-bold text-accent-400">{ic.code}</code>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {ic.usedCount}{ic.maxUses ? `/${ic.maxUses}` : ""} verwendet
                          {ic.expiresAt && ` · Läuft ab: ${new Date(ic.expiresAt).toLocaleDateString("de-DE")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(ic.code)}
                          className="rounded-lg border border-white/10 px-3 py-1 text-xs text-surface-400 hover:bg-white/5 hover:text-white"
                        >
                          Kopieren
                        </button>
                        {ic.isActive && (
                          <button
                            onClick={async () => {
                              if (!slug) return;
                              await api.communities.deleteInviteCode(slug, ic.id);
                              const icRes = await api.communities.listInviteCodes(slug);
                              setInviteCodes(icRes.codes);
                            }}
                            className="rounded-lg border border-red-500/20 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
                          >
                            Deaktivieren
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {inviteCodes.length === 0 && <p className="text-sm text-surface-500">Noch keine Einladungscodes erstellt.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
