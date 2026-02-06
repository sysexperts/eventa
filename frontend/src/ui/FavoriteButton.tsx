import { api } from "../lib/api";
import { useAuth } from "../state/auth";

export function FavoriteButton({
  eventId,
  isFavorited,
  onToggle,
  size = "md",
  className = "",
}: {
  eventId: string;
  isFavorited: boolean;
  onToggle: (eventId: string, favorited: boolean) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const { user } = useAuth();

  if (!user) return null;

  const dim = size === "sm" ? 14 : 18;
  const btn = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.events.toggleFavorite(eventId);
      onToggle(eventId, res.favorited);
    } catch {}
  }

  return (
    <button
      onClick={handleClick}
      className={`flex ${btn} items-center justify-center rounded-full transition-all ${
        isFavorited
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
          : "bg-black/40 text-white/60 hover:bg-black/60 hover:text-white backdrop-blur-sm"
      } ${className}`}
      title={isFavorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
