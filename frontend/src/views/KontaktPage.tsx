import { useState } from "react";

type FormState = "idle" | "sending" | "sent" | "error";

const TOPICS = [
  "Allgemeine Anfrage",
  "Event melden / Problem",
  "Technischer Fehler",
  "Partnerschaft / Kooperation",
  "Presse & Medien",
  "Sonstiges",
];

export function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !topic || !message) return;

    const subject = encodeURIComponent(`[LocalEvents] ${topic} – ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nE-Mail: ${email}\nThema: ${topic}\n\nNachricht:\n${message}`
    );
    window.location.href = `mailto:kontakt@localevents.de?subject=${subject}&body=${body}`;
    setState("sent");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-400">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white">Kontakt</h1>
        <p className="mt-3 text-sm text-surface-400">
          Fragen, Feedback oder Kooperationsanfragen? Wir freuen uns von dir zu hören.
        </p>
      </div>

      {state === "sent" ? (
        <div className="mt-12 rounded-2xl border border-neon-green/20 bg-neon-green/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-green/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-green">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">E-Mail-Client geöffnet</h2>
          <p className="mt-2 text-sm text-surface-400">
            Deine Nachricht wurde vorbereitet. Bitte sende sie über deinen E-Mail-Client ab.
          </p>
          <button
            onClick={() => { setState("idle"); setName(""); setEmail(""); setTopic(""); setMessage(""); }}
            className="mt-6 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Neue Nachricht
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          {/* Name + Email */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-surface-400">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Name"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-surface-500 outline-none transition focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-surface-400">E-Mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-surface-500 outline-none transition focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/20"
              />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-surface-400">Thema *</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    topic === t
                      ? "border-accent-500/50 bg-accent-500/20 text-accent-300"
                      : "border-white/[0.08] bg-white/[0.03] text-surface-400 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-surface-400">Nachricht *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Wie können wir dir helfen?"
              rows={6}
              required
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-surface-500 outline-none transition focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name || !email || !topic || !message || state === "sending"}
            className="w-full rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Nachricht senden
          </button>

          <p className="text-center text-xs text-surface-600">
            ⚠️ TODO: E-Mail-Adresse vor Go-Live ersetzen (aktuell: kontakt@localevents.de)
          </p>
        </form>
      )}

      {/* Alternative contact */}
      <div className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold text-white">Weitere Kontaktmöglichkeiten</h2>
        <div className="mt-4 space-y-3 text-sm text-surface-400">
          <div className="flex items-center gap-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-surface-500">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <span className="text-amber-400">⚠️ TODO: kontakt@localevents.de ersetzen</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-surface-500">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Antwortzeit: in der Regel innerhalb von 2 Werktagen</span>
          </div>
        </div>
      </div>
    </div>
  );
}
