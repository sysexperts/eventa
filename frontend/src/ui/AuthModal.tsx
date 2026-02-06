import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1920&q=80",
];

export function AuthModal() {
  const { login, register, modal, closeModal } = useAuth();
  const navigate = useNavigate();

  // ── Background rotation ──
  const [imgIdx, setImgIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setImgIdx((p: number) => (p + 1) % BG_IMAGES.length);
    }, 6000);
  }, []);
  useEffect(() => {
    if (modal.open) { startTimer(); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [modal.open, startTimer]);

  // ── Login state ──
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginShowPw, setLoginShowPw] = useState(false);

  // ── Register state ──
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regWebsite, setRegWebsite] = useState("");
  const [regErr, setRegErr] = useState("");
  const [regBusy, setRegBusy] = useState(false);
  const [regShowPw, setRegShowPw] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // ── Display mode (for slide animation between login/register) ──
  const [displayMode, setDisplayMode] = useState<"login" | "register">(modal.mode);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");

  // Sync displayMode when modal opens
  useEffect(() => {
    if (modal.open) {
      setDisplayMode(modal.mode);
      setLoginErr("");
      setRegErr("");
    }
  }, [modal.open, modal.mode]);

  // ── Mount/unmount animation ──
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (modal.open) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
    } else {
      setShow(false);
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [modal.open]);

  // Lock body scroll
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  if (!visible) return null;

  function switchMode(mode: "login" | "register") {
    if (mode === displayMode || animating) return;
    setSlideDir(mode === "register" ? "left" : "right");
    setAnimating(true);
    setTimeout(() => {
      setDisplayMode(mode);
      setTimeout(() => setAnimating(false), 50);
    }, 250);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr("");
    setLoginBusy(true);
    try {
      await login(loginEmail, loginPw);
      closeModal();
      navigate("/dashboard");
    } catch {
      setLoginErr("Login fehlgeschlagen. Bitte prüfe E-Mail und Passwort.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegErr("");
    setRegBusy(true);
    try {
      await register({ email: regEmail, password: regPw, name: regName, website: isOrganizer && regWebsite ? regWebsite : undefined });
      closeModal();
      navigate(isOrganizer ? "/dashboard" : "/events");
    } catch {
      setRegErr("Registrierung fehlgeschlagen. Vielleicht existiert die E-Mail bereits.");
    } finally {
      setRegBusy(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-accent-500/20";
  const inputPwCls = "w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-11 text-sm text-white placeholder-surface-500 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-accent-500/20";
  const labelCls = "block text-xs font-semibold uppercase tracking-wider text-surface-400";
  const iconWrapCls = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500";

  const entering = animating;
  const getSlideClass = () => {
    if (entering) {
      return slideDir === "left" ? "translate-x-8 opacity-0" : "-translate-x-8 opacity-0";
    }
    return "translate-x-0 opacity-100";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with rotating images */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}
        onClick={closeModal}
      >
        {/* Rotating background */}
        <div className="absolute inset-0 overflow-hidden">
          {BG_IMAGES.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
              style={{ opacity: i === imgIdx ? 1 : 0 }}
            >
              <img src={src} alt="" className="h-full w-full object-cover" style={{ transform: i === imgIdx ? "scale(1.05)" : "scale(1)", transition: "transform 7s ease-out" }} />
            </div>
          ))}
          <div className="absolute inset-0 bg-surface-950/85 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-surface-950/70" />
        </div>
      </div>

      {/* Card */}
      <div
        className={`relative w-full max-w-md mx-4 transition-all duration-500 ease-out ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}`}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute -top-12 right-0 flex items-center gap-1.5 text-sm text-surface-400 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Schließen
        </button>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          {/* Animated content */}
          <div className={`transition-all duration-300 ease-out ${getSlideClass()}`}>
            {displayMode === "login" ? (
              /* ═══════ LOGIN ═══════ */
              <div>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/20 shadow-lg shadow-accent-500/10">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-400">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white">Willkommen zurück</h1>
                  <p className="mt-1.5 text-sm text-surface-400">Melde dich an, um fortzufahren</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className={labelCls}>E-Mail</label>
                    <div className="relative">
                      <div className={iconWrapCls}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </div>
                      <input type="email" required value={loginEmail} onChange={(e: any) => setLoginEmail(e.target.value)} placeholder="deine@email.de" className={inputCls} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Passwort</label>
                    <div className="relative">
                      <div className={iconWrapCls}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <input type={loginShowPw ? "text" : "password"} required value={loginPw} onChange={(e: any) => setLoginPw(e.target.value)} placeholder="••••••••" className={inputPwCls} />
                      <button type="button" onClick={() => setLoginShowPw(!loginShowPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                        {loginShowPw ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {loginErr && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      {loginErr}
                    </div>
                  )}

                  <button type="submit" disabled={loginBusy} className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent-500/25 transition-all hover:shadow-accent-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loginBusy ? (
                        <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Wird angemeldet...</>
                      ) : (
                        <>Anmelden<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
                  <span className="text-[11px] font-medium text-surface-600 uppercase tracking-wider">oder</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
                </div>

                <p className="text-center text-sm text-surface-400">
                  Noch kein Konto?{" "}
                  <button onClick={() => switchMode("register")} className="font-semibold text-accent-400 hover:text-accent-300 transition-colors">
                    Jetzt registrieren
                  </button>
                </p>
              </div>
            ) : (
              /* ═══════ REGISTER ═══════ */
              <div>
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

                <div className="mb-6 flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                  <button type="button" onClick={() => setIsOrganizer(false)} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${!isOrganizer ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20" : "text-surface-400 hover:text-white"}`}>
                    Besucher
                  </button>
                  <button type="button" onClick={() => setIsOrganizer(true)} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${isOrganizer ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-surface-400 hover:text-white"}`}>
                    Veranstalter
                  </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>{isOrganizer ? "Name / Firma" : "Dein Name"}</label>
                    <div className="relative">
                      <div className={iconWrapCls}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <input required value={regName} onChange={(e: any) => setRegName(e.target.value)} placeholder={isOrganizer ? "Eventhaus GmbH" : "Max Mustermann"} className={inputCls} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>E-Mail</label>
                    <div className="relative">
                      <div className={iconWrapCls}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </div>
                      <input type="email" required value={regEmail} onChange={(e: any) => setRegEmail(e.target.value)} placeholder="deine@email.de" className={inputCls} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Passwort</label>
                    <div className="relative">
                      <div className={iconWrapCls}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <input type={regShowPw ? "text" : "password"} required minLength={8} value={regPw} onChange={(e: any) => setRegPw(e.target.value)} placeholder="Min. 8 Zeichen" className={inputPwCls} />
                      <button type="button" onClick={() => setRegShowPw(!regShowPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                        {regShowPw ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-surface-600">Mindestens 8 Zeichen</p>
                  </div>

                  {isOrganizer && (
                    <div className="space-y-1.5">
                      <label className={labelCls}>Website (optional)</label>
                      <div className="relative">
                        <div className={iconWrapCls}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <input type="url" value={regWebsite} onChange={(e: any) => setRegWebsite(e.target.value)} placeholder="https://meine-location.de" className={inputCls} />
                      </div>
                    </div>
                  )}

                  {isOrganizer && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] px-4 py-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-purple-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      <p className="text-xs text-purple-300/80 leading-relaxed">
                        Als Veranstalter kannst du Events erstellen, deine Website automatisch scannen lassen und detaillierte Statistiken einsehen.
                      </p>
                    </div>
                  )}

                  {regErr && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      {regErr}
                    </div>
                  )}

                  <button type="submit" disabled={regBusy} className={`group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed ${isOrganizer ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-500/25 hover:shadow-purple-500/40" : "bg-gradient-to-r from-accent-500 to-accent-600 shadow-accent-500/25 hover:shadow-accent-500/40"}`}>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {regBusy ? (
                        <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Wird erstellt...</>
                      ) : (
                        <>{isOrganizer ? "Als Veranstalter registrieren" : "Kostenlos registrieren"}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
                  <span className="text-[11px] font-medium text-surface-600 uppercase tracking-wider">oder</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
                </div>

                <p className="text-center text-sm text-surface-400">
                  Bereits registriert?{" "}
                  <button onClick={() => switchMode("login")} className="font-semibold text-accent-400 hover:text-accent-300 transition-colors">
                    Jetzt anmelden
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Demo hint (login only) */}
        {displayMode === "login" && (
          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 text-center backdrop-blur-md">
            <span className="text-xs text-surface-500">
              <strong className="text-surface-400">Demo:</strong> demo@veranstalter.de / password123
            </span>
          </div>
        )}

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
                  ? `h-2 w-6 shadow-md ${displayMode === "register" ? "bg-purple-400 shadow-purple-400/30" : "bg-accent-400 shadow-accent-400/30"}`
                  : "h-2 w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
