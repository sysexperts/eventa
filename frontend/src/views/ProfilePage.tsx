import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Input, Button, Label } from "../ui/components";

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    website: "",
    address: "",
    zip: "",
    city: "",
    phone: "",
    companyName: "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        website: user.website || "",
        address: user.address || "",
        zip: user.zip || "",
        city: user.city || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
      });
    }
  }, [user]);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await api.me.update(form);
      await refresh();
      setMsg("Profil gespeichert.");
    } catch {
      setError("Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwMsg("");

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Passwörter stimmen nicht überein.");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("Neues Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    setPwBusy(true);
    try {
      const res = await api.me.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg(res.message);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      const msg = err?.body?.error || "Passwort ändern fehlgeschlagen.";
      setPwError(typeof msg === "string" ? msg : "Passwort ändern fehlgeschlagen.");
    } finally {
      setPwBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-white">Mein Profil</h1>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Profildaten</h2>

        <div>
          <Label>Name</Label>
          <Input required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label>E-Mail</Label>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-surface-500">{user.email}</div>
        </div>

        {(user.isAdmin || user.isPartner || user.website) && (
          <>
            <div>
              <Label>Firmenname / Veranstaltungsort (optional)</Label>
              <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="z.B. Kulturhaus Mitte" />
            </div>
            <div>
              <Label>Webseite (optional)</Label>
              <Input type="url" placeholder="https://…" value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>
            <div>
              <Label>Telefon (optional)</Label>
              <Input type="tel" placeholder="+49 …" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>

            <div className="border-t border-white/[0.06] pt-4 mt-4">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Adresse</h3>
              <div className="space-y-3">
                <div>
                  <Label>Straße & Hausnummer</Label>
                  <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Musterstraße 1" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>PLZ</Label>
                    <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="12345" />
                  </div>
                  <div>
                    <Label>Stadt</Label>
                    <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Berlin" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {msg && <p className="text-sm text-green-400">{msg}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" disabled={busy}>
          {busy ? "Speichere…" : "Profil speichern"}
        </Button>
      </form>

      {/* Password Change */}
      <form onSubmit={handlePasswordChange} className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Passwort ändern</h2>

        <div>
          <Label>Aktuelles Passwort</Label>
          <Input
            type="password"
            required
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
        </div>
        <div>
          <Label>Neues Passwort (min. 8 Zeichen)</Label>
          <Input
            type="password"
            required
            minLength={8}
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
          />
        </div>
        <div>
          <Label>Neues Passwort bestätigen</Label>
          <Input
            type="password"
            required
            minLength={8}
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          />
        </div>

        {pwMsg && <p className="text-sm text-green-400">{pwMsg}</p>}
        {pwError && <p className="text-sm text-red-400">{pwError}</p>}

        <Button type="submit" disabled={pwBusy}>
          {pwBusy ? "Ändere…" : "Passwort ändern"}
        </Button>
      </form>
    </div>
  );
}
