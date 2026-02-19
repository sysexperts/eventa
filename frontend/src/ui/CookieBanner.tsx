import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Cookie } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

type ConsentState = "accepted" | "declined" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState;
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
    setConsent(stored);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setConsent("declined");
    setVisible(false);
  }

  if (!visible || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-Einstellungen"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md"
    >
      <div className="relative rounded-2xl border border-white/10 bg-surface-900/95 p-5 shadow-2xl backdrop-blur-md">
        {/* Close */}
        <button
          onClick={decline}
          aria-label="Schließen"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-surface-500 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/20">
            <Cookie className="h-5 w-5 text-accent-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">Cookies & Datenschutz</h2>
        </div>

        {/* Text */}
        <p className="mt-3 text-xs leading-relaxed text-surface-400">
          Wir verwenden ausschließlich{" "}
          <span className="text-surface-200">technisch notwendige Cookies</span> für die
          Anmeldung und Session-Verwaltung. Keine Tracking- oder Werbe-Cookies.{" "}
          <Link to="/datenschutz" className="text-accent-400 underline-offset-2 hover:underline">
            Datenschutzerklärung
          </Link>
        </p>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={accept}
            className="flex-1 rounded-xl bg-accent-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
          >
            Akzeptieren
          </button>
          <button
            onClick={decline}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-surface-300 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/30"
          >
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  );
}
