export type ApiError = { error: unknown };

const API_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(!(init?.body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(init?.headers || {})
    },
    credentials: "include"
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    throw { status: res.status, body };
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type User = {
  id: string;
  email: string;
  name: string;
  website?: string | null;
  address?: string | null;
  zip?: string | null;
  city?: string | null;
  phone?: string | null;
  companyName?: string | null;
  avatarUrl?: string | null;
  isPartner: boolean;
  isAdmin: boolean;
  promotionTokens: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  website?: string | null;
  isPartner: boolean;
  isAdmin: boolean;
  promotionTokens: number;
  createdAt: string;
  monitoredUrls: MonitoredUrl[];
  _count: { events: number; scrapedEvents: number };
};

export type MonitoredUrl = {
  id: string;
  url: string;
  label: string;
  isActive: boolean;
  isGlobal?: boolean;
  defaultCategory?: string | null;
  defaultCity?: string | null;
  lastScrapedAt?: string | null;
  lastEventCount: number;
  errorCount: number;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GlobalSource = MonitoredUrl & {
  user?: { name: string; email: string };
};

export type EventCategory =
  | "KONZERT" | "FESTIVAL" | "MUSICAL" | "OPER" | "KABARETT" | "OPEN_MIC" | "DJ_EVENT"
  | "THEATER" | "COMEDY" | "TANZ" | "ZAUBERSHOW"
  | "AUSSTELLUNG" | "LESUNG" | "FILM" | "FOTOGRAFIE" | "MUSEUM"
  | "FLOHMARKT" | "WOCHENMARKT" | "WEIHNACHTSMARKT" | "MESSE" | "FOOD_FESTIVAL"
  | "SPORT" | "LAUF" | "TURNIER" | "YOGA" | "WANDERUNG"
  | "KINDERTHEATER" | "FAMILIENTAG" | "KINDER_WORKSHOP"
  | "WEINPROBE" | "CRAFT_BEER" | "KOCHKURS" | "FOOD_TRUCK" | "KULINARISCHE_TOUR"
  | "WORKSHOP" | "SEMINAR" | "KONFERENZ" | "NETWORKING" | "VORTRAG"
  | "CLUBNACHT" | "KARAOKE" | "PARTY"
  | "KARNEVAL" | "OKTOBERFEST" | "SILVESTER" | "STADTFEST" | "STRASSENFEST"
  | "SONSTIGES";

export type EventListItem = {
  id: string;
  title: string;
  shortDescription: string;
  category: EventCategory;
  startsAt: string;
  endsAt?: string | null;
  city: string;
  country: string;
  imageUrl?: string | null;
  heroVideoUrl?: string | null;
  ticketUrl?: string | null;
  price?: string | null;
  tags: string[];
  community?: string | null;
  isFeatured: boolean;
  heroFocusY?: number;
  isPromoted?: boolean;
  organizer: { id: string; name: string };
};

export type SimilarEvent = {
  id: string;
  title: string;
  shortDescription: string;
  category: EventCategory;
  startsAt: string;
  city: string;
  imageUrl?: string | null;
  price?: string | null;
};

export type EventDetail = EventListItem & {
  description: string;
  address: string;
  organizer: { id: string; name: string; website?: string | null };
};

export type Artist = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  imageUrl?: string | null;
  headerImageUrl?: string | null;
  genre: string;
  hometown: string;
  tags: string[];
  website?: string | null;
  instagram?: string | null;
  spotify?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  soundcloud?: string | null;
  bandcamp?: string | null;
  pressQuote: string;
  _count?: { events: number; followers?: number; reviews?: number };
  avgRating?: number;
  followerCount?: number;
  reviewCount?: number;
  reviews?: ArtistReview[];
};

export type ArtistReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string };
};

export type DashboardEventStat = {
  id: string;
  title: string;
  category: EventCategory;
  startsAt: string;
  city: string;
  imageUrl?: string | null;
  isFeatured: boolean;
  isPromoted: boolean;
  hasTicketUrl: boolean;
  views: number;
  ticketClicks: number;
  conversionRate: number;
};

export type DashboardSummary = {
  totalEvents: number;
  activeEvents: number;
  pastEvents: number;
  totalViews: number;
  totalClicks: number;
  views7d: number;
  clicks7d: number;
  conversionRate: number;
};

export type DashboardChartPoint = {
  date: string;
  views: number;
  clicks: number;
};

export type DashboardStats = {
  summary: DashboardSummary;
  chartData: DashboardChartPoint[];
  events: DashboardEventStat[];
};

export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  country?: string | null;
  flagCode?: string | null;
  flagUrl?: string | null;
  language?: string | null;
  isActive?: boolean;
  showOnHomepage?: boolean;
  // Location & Contact
  city?: string | null;
  region?: string | null;
  timezone?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  phone?: string | null;
  // Social Links
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  discord?: string | null;
  telegram?: string | null;
  tiktok?: string | null;
  // Settings
  category?: string | null;
  tags?: string[];
  visibility?: "PUBLIC" | "PRIVATE" | "HIDDEN";
  rules?: string;
  welcomeMessage?: string;
  maxMembers?: number | null;
  color?: string | null;
  createdAt?: string;
  _count?: { members: number; events: number; inviteCodes?: number };
  members?: { role: string; user: { id: string; name: string }; joinedAt: string }[];
};

export type CommunityMember = {
  id: string;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  joinedAt: string;
  user: { id: string; name: string; email?: string };
};

export type CommunityInviteCode = {
  id: string;
  code: string;
  label: string;
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  eventCategory?: string | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  showOnHomepage: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventComment = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string };
  parentId?: string | null;
  replies?: EventComment[];
};

export type EventAttendance = {
  count: number;
  attending: boolean;
  attendees: { user: { id: string; name: string }; createdAt: string }[];
};

export type ScrapedEvent = {
  id: string;
  sourceUrl: string;
  title: string;
  shortDescription: string;
  description: string;
  category: EventCategory;
  startsAt?: string | null;
  endsAt?: string | null;
  address: string;
  city: string;
  country: string;
  imageUrl?: string | null;
  ticketUrl?: string | null;
  price?: string | null;
  tags: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string; website?: string }) =>
      request<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    logout: () => request<void>("/api/auth/logout", { method: "POST" })
  },
  me: {
    get: () => request<{ user: User }>("/api/me"),
    update: (data: { name?: string; website?: string; address?: string; zip?: string; city?: string; phone?: string; companyName?: string }) =>
      request<{ user: User }>("/api/me", {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>("/api/me/password", {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return request<{ user: User }>("/api/me/avatar", {
        method: "POST",
        body: formData as any,
        headers: {} // Let fetch set Content-Type for FormData
      });
    },
  },
  events: {
    list: (params: { category?: string; city?: string; from?: string; to?: string; q?: string; community?: string }) => {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v) sp.set(k, v);
      }
      const qs = sp.toString();
      return request<{ events: EventListItem[] }>(`/api/events${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => request<{ event: EventDetail; similar: SimilarEvent[] }>(`/api/events/${id}`),
    featured: () => request<{ events: EventListItem[] }>("/api/events/featured"),
    myList: () => request<{ events: Omit<EventListItem, "organizer">[] }>("/api/events/me/list"),
    create: (data: any) =>
      request<{ id: string }>("/api/events", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    update: (id: string, data: any) =>
      request<void>(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    remove: (id: string) => request<void>(`/api/events/${id}`, { method: "DELETE" }),
    toggleFeatured: (id: string) => request<{ isFeatured: boolean }>(`/api/events/${id}/featured`, { method: "PATCH" }),
    trackView: (id: string) => request<{ ok: boolean }>(`/api/events/${id}/track-view`, { method: "POST" }),
    trackTicketClick: (id: string) => request<{ ok: boolean }>(`/api/events/${id}/track-ticket-click`, { method: "POST" }),
    myStats: () => request<DashboardStats>("/api/events/my-stats"),
    uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_URL}/api/events/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload fehlgeschlagen");
      return res.json();
    },
    uploadVideo: async (file: File): Promise<{ videoUrl: string }> => {
      const formData = new FormData();
      formData.append("video", file);
      const res = await fetch(`${API_URL}/api/events/upload-video`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Video-Upload fehlgeschlagen");
      return res.json();
    },
    favorites: () => request<{ events: EventListItem[] }>("/api/events/favorites"),
    favoriteIds: () => request<{ ids: string[] }>("/api/events/favorites/ids"),
    toggleFavorite: (id: string) => request<{ favorited: boolean }>(`/api/events/favorites/${id}`, { method: "POST" }),
  },
  scrape: {
    trigger: (url: string) =>
      request<{ message: string; count: number; events: ScrapedEvent[] }>("/api/scrape/trigger", {
        method: "POST",
        body: JSON.stringify({ url }),
      }),
    list: (status?: string) => {
      const qs = status ? `?status=${status}` : "";
      return request<{ events: ScrapedEvent[] }>(`/api/scrape/events${qs}`);
    },
    update: (id: string, data: Partial<ScrapedEvent>) =>
      request<{ event: ScrapedEvent }>(`/api/scrape/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    approve: (id: string, promote?: boolean, artistIds?: string[]) =>
      request<{ message: string; eventId: string }>(`/api/scrape/events/${id}/approve`, {
        method: "PUT",
        body: JSON.stringify({ promote: promote || false, artistIds: artistIds || [] }),
      }),
    reject: (id: string) =>
      request<{ message: string }>(`/api/scrape/events/${id}/reject`, { method: "PUT" }),
    remove: (id: string) =>
      request<void>(`/api/scrape/events/${id}`, { method: "DELETE" }),
  },
  admin: {
    listUsers: () => request<{ users: AdminUser[] }>("/api/admin/users"),
    updateUser: (id: string, data: { isPartner?: boolean; promotionTokens?: number }) =>
      request<{ user: any }>(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    addUrls: (userId: string, urls: { url: string; label?: string }[]) =>
      request<{ created: number; skipped: number }>(`/api/admin/users/${userId}/monitored-urls`, {
        method: "POST",
        body: JSON.stringify({ urls }),
      }),
    deleteUrl: (urlId: string) =>
      request<void>(`/api/admin/monitored-urls/${urlId}`, { method: "DELETE" }),
    updateUrl: (urlId: string, data: { isActive?: boolean; label?: string }) =>
      request<{ url: MonitoredUrl }>(`/api/admin/monitored-urls/${urlId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    listGlobalSources: () =>
      request<{ sources: GlobalSource[] }>("/api/admin/global-sources"),
    addGlobalSource: (data: { url: string; label?: string; defaultCategory?: string; defaultCity?: string }) =>
      request<{ source: GlobalSource }>("/api/admin/global-sources", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateGlobalSource: (id: string, data: { label?: string; isActive?: boolean; defaultCategory?: string | null; defaultCity?: string | null }) =>
      request<{ source: GlobalSource }>(`/api/admin/global-sources/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteGlobalSource: (id: string) =>
      request<void>(`/api/admin/global-sources/${id}`, { method: "DELETE" }),
    scrapeGlobalSource: (id: string) =>
      request<{ newEvents: number; skipped: number; error?: string }>(`/api/admin/global-sources/${id}/scrape-now`, {
        method: "POST",
      }),
    searchUsers: (q = "", page = 1) =>
      request<{ users: (AdminUser & { _count: { events: number; communityMembers: number } })[]; total: number; page: number; pages: number }>(`/api/admin/users/search?q=${encodeURIComponent(q)}&page=${page}`),
    listEvents: () =>
      request<{ events: { id: string; title: string; category: string; city: string; startsAt: string; isFeatured: boolean; isPromoted: boolean; createdAt: string; organizer: { id: string; name: string } | null; _count: { views: number; ticketClicks: number } }[] }>("/api/admin/events"),
    listCommunities: () =>
      request<{ communities: Community[] }>("/api/admin/communities"),
    createCommunity: (data: { slug: string; name: string; description?: string; imageUrl?: string | null; bannerUrl?: string | null; country?: string | null; language?: string | null }) =>
      request<{ community: Community }>("/api/admin/communities", { method: "POST", body: JSON.stringify(data) }),
    updateCommunity: (id: string, data: Partial<Community> & { isActive?: boolean }) =>
      request<{ community: Community }>(`/api/admin/communities/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCommunity: (id: string) =>
      request<void>(`/api/admin/communities/${id}`, { method: "DELETE" }),
    assignCommunityRole: (communityId: string, userId: string, role: string) =>
      request<{ member: CommunityMember }>(`/api/admin/communities/${communityId}/assign-role`, { method: "POST", body: JSON.stringify({ userId, role }) }),
    listCommunityMembers: (communityId: string, q = "", page = 1) =>
      request<{ members: CommunityMember[]; total: number; page: number; pages: number }>(`/api/admin/communities/${communityId}/members?q=${encodeURIComponent(q)}&page=${page}`),
    removeCommunityMember: (communityId: string, memberId: string) =>
      request<void>(`/api/admin/communities/${communityId}/members/${memberId}`, { method: "DELETE" }),
    getSettings: () =>
      request<{ settings: Record<string, string> }>("/api/admin/settings"),
    updateSettings: (data: Record<string, string>) =>
      request<{ settings: Record<string, string> }>("/api/admin/settings", { method: "PUT", body: JSON.stringify(data) }),
    listCategories: () =>
      request<{ categories: CategoryItem[] }>("/api/admin/categories"),
    createCategory: (data: { slug: string; name: string; eventCategory?: string | null; imageUrl?: string | null; iconUrl?: string | null; icon?: string | null; sortOrder?: number; showOnHomepage?: boolean }) =>
      request<{ category: CategoryItem }>("/api/admin/categories", { method: "POST", body: JSON.stringify(data) }),
    updateCategory: (id: string, data: Partial<CategoryItem>) =>
      request<{ category: CategoryItem }>(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCategory: (id: string) =>
      request<void>(`/api/admin/categories/${id}`, { method: "DELETE" }),
    // User Management
    banUser: (id: string, isBanned: boolean) =>
      request<{ user: any; message: string }>(`/api/admin/users/${id}/ban`, {
        method: "PATCH",
        body: JSON.stringify({ isBanned }),
      }),
    deleteUser: (id: string) =>
      request<{ message: string; deletedEventsCount: number }>(`/api/admin/users/${id}`, { method: "DELETE" }),
    // Event Management
    blockEvent: (id: string, isBlocked: boolean) =>
      request<{ event: any; message: string }>(`/api/admin/events/${id}/block`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked }),
      }),
    deleteEvent: (id: string) =>
      request<{ message: string }>(`/api/admin/events/${id}`, { method: "DELETE" }),
  },
  artists: {
    list: () => request<{ artists: Artist[] }>("/api/artists"),
    get: (slug: string) => request<{ artist: Artist & { events: EventListItem[] } }>(`/api/artists/${slug}`),
    create: (data: Partial<Artist>) =>
      request<{ artist: Artist }>("/api/artists", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Artist>) =>
      request<{ artist: Artist }>(`/api/artists/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<void>(`/api/artists/${id}`, { method: "DELETE" }),
    uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_URL}/api/artists/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload fehlgeschlagen");
      return res.json();
    },
    followStatus: (slug: string) =>
      request<{ following: boolean }>(`/api/artists/${slug}/follow-status`),
    toggleFollow: (slug: string) =>
      request<{ following: boolean; followerCount: number }>(`/api/artists/${slug}/follow`, { method: "POST" }),
    addReview: (slug: string, data: { rating: number; comment?: string }) =>
      request<{ review: ArtistReview }>(`/api/artists/${slug}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    deleteReview: (slug: string) =>
      request<void>(`/api/artists/${slug}/reviews`, { method: "DELETE" }),
  },
  backup: {
    createBackup: async (): Promise<Blob> => {
      const res = await fetch(`${API_URL}/api/backup/create`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Backup fehlgeschlagen");
      return res.blob();
    },
    listBackups: () =>
      request<{ backups: Array<{ filename: string; size: number; created: string }> }>("/api/backup/list"),
    restoreBackup: (backupData: string) =>
      request<{ message: string }>("/api/backup/restore", {
        method: "POST",
        body: JSON.stringify({ backupData }),
      }),
    getStats: () =>
      request<{ users: number; events: number; communities: number; categories: number; totalRecords: number }>("/api/backup/stats"),
  },
  categories: {
    list: () => request<{ categories: CategoryItem[] }>("/api/categories"),
  },
  communities: {
    list: () => request<{ communities: Community[] }>("/api/communities"),
    get: (slug: string) => request<{ community: Community }>(`/api/communities/${slug}`),
    events: (slug: string, page = 1) => request<{ events: EventListItem[]; total: number; page: number; pages: number }>(`/api/communities/${slug}/events?page=${page}`),
    members: (slug: string, page = 1) => request<{ members: CommunityMember[]; total: number; page: number; pages: number }>(`/api/communities/${slug}/members?page=${page}`),
    join: (slug: string) => request<{ member: any }>(`/api/communities/${slug}/join`, { method: "POST" }),
    leave: (slug: string) => request<void>(`/api/communities/${slug}/leave`, { method: "POST" }),
    joinByCode: (code: string) => request<{ member: any; community: Community }>("/api/communities/join-by-code", { method: "POST", body: JSON.stringify({ code }) }),
    myMembership: (slug: string) => request<{ membership: { id: string; role: string; joinedAt: string } | null }>(`/api/communities/${slug}/my-membership`),
    update: (slug: string, data: Partial<Community>) => request<{ community: Community }>(`/api/communities/${slug}`, { method: "PUT", body: JSON.stringify(data) }),
    updateMemberRole: (slug: string, memberId: string, role: string) => request<{ member: CommunityMember }>(`/api/communities/${slug}/members/${memberId}`, { method: "PUT", body: JSON.stringify({ role }) }),
    removeMember: (slug: string, memberId: string) => request<void>(`/api/communities/${slug}/members/${memberId}`, { method: "DELETE" }),
    createInviteCode: (slug: string, data: { label?: string; maxUses?: number | null; expiresInDays?: number | null }) => request<{ invite: CommunityInviteCode }>(`/api/communities/${slug}/invite-codes`, { method: "POST", body: JSON.stringify(data) }),
    listInviteCodes: (slug: string) => request<{ codes: CommunityInviteCode[] }>(`/api/communities/${slug}/invite-codes`),
    deleteInviteCode: (slug: string, codeId: string) => request<void>(`/api/communities/${slug}/invite-codes/${codeId}`, { method: "DELETE" }),
  },
  comments: {
    list: (eventId: string) => request<{ comments: EventComment[]; total: number }>(`/api/events/${eventId}/comments`),
    create: (eventId: string, data: { text: string; parentId?: string }) => request<{ comment: EventComment }>(`/api/events/${eventId}/comments`, { method: "POST", body: JSON.stringify(data) }),
    update: (commentId: string, text: string) => request<{ comment: EventComment }>(`/api/comments/${commentId}`, { method: "PUT", body: JSON.stringify({ text }) }),
    remove: (commentId: string) => request<void>(`/api/comments/${commentId}`, { method: "DELETE" }),
  },
  stats: {
    getPublic: () => request<{
      activeEvents: number;
      totalUsers: number;
      avgArtistRating: number;
      totalArtists: number;
      citiesCount: number;
      recentActivity: {
        views24h: number;
        ticketClicks24h: number;
      };
      trendingEvents: Array<{
        id: string;
        title: string;
        city: string;
        startsAt: string;
        views: number;
      }>;
      nextEvent?: {
        id: string;
        title: string;
        city: string;
        startsAt: string;
      };
      lastUpdated: string;
    }>("/api/stats/public"),
    getActivity: () => request<{
      activities: Array<{
        type: 'view' | 'click';
        eventTitle: string;
        city: string;
        timestamp: string;
        timeAgo: string;
      }>;
    }>("/api/stats/activity"),
  },
  attendance: {
    get: (eventId: string) => request<EventAttendance>(`/api/events/${eventId}/attendance`),
    toggle: (eventId: string) => request<{ attending: boolean; count: number }>(`/api/events/${eventId}/attend`, { method: "POST" }),
  },
  monitoredUrls: {
    list: () => request<{ urls: MonitoredUrl[] }>("/api/monitored-urls"),
    add: (data: { url: string; label?: string }) =>
      request<{ url: MonitoredUrl }>("/api/monitored-urls", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { label?: string; isActive?: boolean }) =>
      request<{ url: MonitoredUrl }>(`/api/monitored-urls/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<void>(`/api/monitored-urls/${id}`, { method: "DELETE" }),
    scrapeNow: (id: string) =>
      request<{ newEvents: number; skipped: number; error?: string }>(`/api/monitored-urls/${id}/scrape-now`, {
        method: "POST",
      }),
  },
};
