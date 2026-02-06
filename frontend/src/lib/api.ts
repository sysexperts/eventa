export type ApiError = { error: unknown };

const API_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
  lastScrapedAt?: string | null;
  lastEventCount: number;
  errorCount: number;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventCategory = "KONZERT" | "THEATER" | "LESUNG" | "COMEDY" | "SONSTIGES";

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
  ticketUrl?: string | null;
  price?: string | null;
  tags: string[];
  community?: string | null;
  isFeatured: boolean;
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
    remove: (id: string) => request<void>(`/api/events/${id}`, { method: "DELETE" })
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
