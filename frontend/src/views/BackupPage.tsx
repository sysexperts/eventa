import { useState, useEffect } from "react";
import { useAuth } from "../state/auth";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export function BackupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/");
      return;
    }
    loadStats();
  }, [user, navigate]);

  async function loadStats() {
    try {
      const res = await api.backup.getStats();
      setStats(res);
    } catch (err: any) {
      setError("Statistiken konnten nicht geladen werden.");
    }
  }

  async function handleCreateBackup() {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const blob = await api.backup.createBackup();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMessage("✅ Backup erfolgreich erstellt und heruntergeladen!");
    } catch (err: any) {
      setError("❌ Backup fehlgeschlagen: " + (err.message || "Unbekannter Fehler"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRestoreBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("⚠️ WARNUNG: Das Wiederherstellen eines Backups überschreibt ALLE aktuellen Daten!\n\nBist du sicher?")) {
      e.target.value = "";
      return;
    }

    if (!confirm("⚠️ LETZTE WARNUNG: Alle aktuellen Events, User und Daten werden überschrieben!\n\nWirklich fortfahren?")) {
      e.target.value = "";
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const backupData = await file.text();
      const res = await api.backup.restoreBackup(backupData);
      setMessage("✅ " + res.message);
      await loadStats();
    } catch (err: any) {
      setError("❌ Wiederherstellung fehlgeschlagen: " + (err.message || "Unbekannter Fehler"));
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">🔒 Datenbank Backup & Restore</h1>
          <p className="mt-2 text-surface-400">Sichere deine Daten oder stelle ein Backup wieder her</p>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-bold text-white">📊 Datenbank-Statistiken</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-accent-400">{stats.users}</div>
                <div className="text-xs text-surface-400">Benutzer</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.events}</div>
                <div className="text-xs text-surface-400">Events</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.communities}</div>
                <div className="text-xs text-surface-400">Communities</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.categories}</div>
                <div className="text-xs text-surface-400">Kategorien</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-surface-500">
              Gesamt: {stats.totalRecords} Datensätze
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Backup Section */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>💾</span>
            Backup erstellen
          </h2>
          <p className="mb-4 text-sm text-surface-400">
            Erstelle ein vollständiges Backup aller Daten (Benutzer, Events, Communities, etc.)
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "⏳ Erstelle Backup..." : "📥 Backup herunterladen"}
          </button>
        </div>

        {/* Restore Section */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>⚠️</span>
            Backup wiederherstellen
          </h2>
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-semibold text-red-300">🚨 ACHTUNG - GEFÄHRLICHE AKTION!</p>
            <ul className="mt-2 space-y-1 text-xs text-red-400">
              <li>• Alle aktuellen Daten werden überschrieben</li>
              <li>• Alle Events, Benutzer und Communities werden ersetzt</li>
              <li>• Diese Aktion kann NICHT rückgängig gemacht werden</li>
              <li>• Erstelle vorher ein aktuelles Backup!</li>
            </ul>
          </div>
          <label className="block">
            <input
              type="file"
              accept=".sql"
              onChange={handleRestoreBackup}
              disabled={loading}
              className="block w-full text-sm text-surface-400 file:mr-4 file:rounded-lg file:border-0 file:bg-red-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-300 hover:file:bg-red-500/30 disabled:opacity-50"
            />
          </label>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-300">
            <span>ℹ️</span>
            Wichtige Hinweise
          </h3>
          <ul className="space-y-1 text-xs text-blue-400">
            <li>• Backups enthalten ALLE Daten im SQL-Format</li>
            <li>• Erstelle regelmäßig Backups (z.B. täglich oder wöchentlich)</li>
            <li>• Bewahre Backups an einem sicheren Ort auf</li>
            <li>• Teste Backups gelegentlich auf einer Test-Umgebung</li>
            <li>• Backups enthalten KEINE hochgeladenen Bilder/Videos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
