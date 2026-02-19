export function EventCardSkeleton({ size = "normal" }: { size?: "normal" | "compact" }) {
  if (size === "compact") {
    return (
      <div className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="h-20 w-20 shrink-0 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="flex flex-1 flex-col justify-center gap-2">
          <div className="h-2.5 w-24 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="h-3.5 w-3/4 rounded-full bg-white/[0.08] animate-pulse" />
          <div className="h-2.5 w-16 rounded-full bg-white/[0.06] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-white/[0.06] animate-pulse">
        {/* Badge placeholders */}
        <div className="absolute left-3 top-3">
          <div className="h-4 w-16 rounded-full bg-white/[0.08] animate-pulse" />
        </div>
        {/* Category + date bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-2">
          <div className="h-4 w-20 rounded-full bg-white/[0.08] animate-pulse" />
          <div className="h-3 w-16 rounded-full bg-white/[0.06] animate-pulse" />
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        <div className="h-4 w-5/6 rounded-full bg-white/[0.08] animate-pulse" />
        <div className="h-3.5 w-full rounded-full bg-white/[0.06] animate-pulse" />
        <div className="h-3.5 w-4/5 rounded-full bg-white/[0.06] animate-pulse" />

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="h-3 w-20 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="flex gap-1">
            <div className="h-4 w-12 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-12 rounded-full bg-white/[0.06] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventCardSkeletonGrid({ count = 6, size = "normal" }: { count?: number; size?: "normal" | "compact" }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} size={size} />
      ))}
    </>
  );
}
