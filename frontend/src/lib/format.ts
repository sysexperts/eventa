const CATEGORY_LABELS: Record<string, string> = {
  KONZERT: "Konzert",
  THEATER: "Theater",
  LESUNG: "Lesung",
  COMEDY: "Comedy",
  SONSTIGES: "Sonstiges",
};

export function categoryLabel(c: string) {
  return CATEGORY_LABELS[c] ?? c;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
