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
  isFeatured: boolean;
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
    update: (data: { name?: string; website?: string }) =>
      request<{ user: User }>("/api/me", {
        method: "PUT",
        body: JSON.stringify(data)
      })
  },
  events: {
    list: (params: { category?: string; city?: string; from?: string; to?: string; q?: string }) => {
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
    approve: (id: string) =>
      request<{ message: string; eventId: string }>(`/api/scrape/events/${id}/approve`, { method: "PUT" }),
    reject: (id: string) =>
      request<{ message: string }>(`/api/scrape/events/${id}/reject`, { method: "PUT" }),
    remove: (id: string) =>
      request<void>(`/api/scrape/events/${id}`, { method: "DELETE" }),
  }
};
