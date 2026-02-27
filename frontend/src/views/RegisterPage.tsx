import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1920&q=80",
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setImgIdx((p) => (p + 1) % BG_IMAGES.length);
    }, 6000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ email, password, name, website: isOrganizer && website ? website : undefined });
      navigate(isOrganizer ? "/dashboard" : "/events");
    } catch {
      setError("Registrierung fehlgeschlagen. Vielleicht existiert die E-Mail bereits.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      {/* ══════════ Fullscreen rotating background ══════════ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BG_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: i === imgIdx ? 1 : 0 }}
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              style={{
                transform: i === imgIdx ? "scale(1.05)" : "scale(1)",
                transition: "transform 7s ease-out",
              }}
            />
          </div>
        ))}
        {/* Dark overlays */}
        <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-surface-950/70" />
      </div>

      {/* ══════════ Centered card ══════════ */}
      <div className="relative w-full max-w-md">
        {/* Glass card */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 shadow-lg shadow-purple-500/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Konto erstellen</h1>
            <p className="mt-1.5 text-sm text-surface-400">Entdecke Events in deiner Nähe</p>
          </div>

          {/* Account type toggle */}
          <div className="mb-6 flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setIsOrganizer(false)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                !isOrganizer
                  ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20"
                  : "text-surface-400 hover:text-white"
              }`}
            >
              Besucher
            </button>
            <button
              type="button"
              onClick={() => setIsOrganizer(true)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                isOrganizer
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-surface-400 hover:text-white"
              }`}
            >
              Veranstalter
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400">
                {isOrganizer ? "Name / Firma" : "Dein Name"}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input
                  required
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                  placeholder={isOrganizer ? "Eventhaus GmbH" : "Max Mustermann"}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-accent-500/20"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400">E-Mail</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-accent-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400">Passwort</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  placeholder="Min. 8 Zeichen"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-11 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-accent-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-surface-600">Mindestens 8 Zeichen</p>
            </div>

            {/* Organizer: Website */}
            {isOrganizer && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400">Website (optional)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <input
                    type="url"
                    value={website}
                    onChange={(e: any) => setWebsite(e.target.value)}
                    placeholder="https://meine-location.de"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
              </div>
            )}

            {/* Organizer info */}
            {isOrganizer && (
              <div className="flex items-start gap-2.5 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-purple-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <p className="text-xs text-purple-300/80 leading-relaxed">
                  Als Veranstalter kannst du Events erstellen, deine Website automatisch scannen lassen und detaillierte Statistiken einsehen.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className={`group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                isOrganizer
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-500/25 hover:shadow-purple-500/40"
                  : "bg-gradient-to-r from-accent-500 to-accent-600 shadow-accent-500/25 hover:shadow-accent-500/40"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {busy ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    {isOrganizer ? "Als Veranstalter registrieren" : "Kostenlos registrieren"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <span className="text-[11px] font-medium text-surface-600 uppercase tracking-wider">oder</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          </div>

          {/* Google Login */}
          <a
            href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white py-3 text-sm font-semibold text-surface-900 shadow-lg transition-all hover:bg-white/95 hover:shadow-xl"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Mit Google {isOrganizer ? "registrieren" : "anmelden"}</span>
          </a>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-surface-400">
            Bereits registriert?{" "}
            <Link to="/login" className="font-semibold text-accent-400 hover:text-accent-300 transition-colors">
              Jetzt anmelden
            </Link>
          </p>
        </div>

        {/* Trust indicators */}
        <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-surface-500">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            SSL verschlüsselt
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            DSGVO-konform
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Sicher
          </span>
        </div>

        {/* Image dots */}
        <div className="mt-5 flex justify-center gap-2">
          {BG_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setImgIdx(i); startTimer(); }}
              className={`rounded-full transition-all duration-500 ${
                i === imgIdx
                  ? "h-2 w-6 bg-purple-400 shadow-md shadow-purple-400/30"
                  : "h-2 w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
