import { Link, useNavigate } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* Big 404 */}
      <div className="relative select-none">
        <span className="text-[10rem] font-black leading-none text-white/[0.04] sm:text-[14rem]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-2">
            <div className="text-4xl font-black text-white sm:text-5xl">Seite nicht gefunden</div>
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-md text-base text-surface-400">
        Die Seite die du suchst existiert nicht oder wurde verschoben.
        Vielleicht findest du hier was du suchst:
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-400"
        >
          <Home className="h-4 w-4" />
          Zur Startseite
        </Link>
        <Link
          to="/events"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <Search className="h-4 w-4" />
          Events entdecken
        </Link>
      </div>
    </div>
  );
}
