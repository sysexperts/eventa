import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { Input, Button, Label } from "../ui/components";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Login fehlgeschlagen. Bitte prüfe E-Mail und Passwort.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Willkommen zurück</h1>
        <p className="mt-1 text-sm text-surface-400">Melde dich an, um deine Events zu verwalten</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <div>
          <Label>E-Mail</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Passwort</Label>
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? "Lade…" : "Einloggen"}
        </Button>
      </form>
      <p className="text-center text-sm text-surface-500">
        Noch kein Konto?{" "}
        <Link to="/register" className="text-accent-400 hover:text-accent-300 transition-colors">
          Registrieren
        </Link>
      </p>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs text-surface-400">
        <strong className="text-surface-300">Demo-Login:</strong> demo@veranstalter.de / password123
      </div>
    </div>
  );
}
