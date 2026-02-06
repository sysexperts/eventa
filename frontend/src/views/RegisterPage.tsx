import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { Input, Button, Label } from "../ui/components";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ email, password, name, website: website || undefined });
      navigate("/dashboard");
    } catch {
      setError("Registrierung fehlgeschlagen. Vielleicht existiert die E-Mail bereits.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Konto erstellen</h1>
        <p className="mt-1 text-sm text-surface-400">Veröffentliche deine Events kostenlos</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <div>
          <Label>Name des Veranstalters</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>E-Mail</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Passwort (min. 8 Zeichen)</Label>
          <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <Label>Website (optional)</Label>
          <Input type="url" placeholder="https://…" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? "Lade…" : "Registrieren"}
        </Button>
      </form>
      <p className="text-center text-sm text-surface-500">
        Bereits registriert?{" "}
        <Link to="/login" className="text-accent-400 hover:text-accent-300 transition-colors">
          Login
        </Link>
      </p>
    </div>
  );
}
