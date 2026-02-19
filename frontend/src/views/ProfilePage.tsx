import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Input, Button, Label } from "../ui/components";
import { User, Mail, Globe, Phone, Building2, MapPin, Lock, Shield, Calendar, Ticket } from "lucide-react";

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

  const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-900 p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent-500/20 text-3xl font-bold text-accent-400 ring-4 ring-accent-500/10">
            {initials}
          </div>
          
          {/* Identity Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{user.name}</h1>
              {user.isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
              {user.isPartner && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  <Ticket className="h-3 w-3" />
                  Partner
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-surface-400">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs text-surface-300">
                <Calendar className="h-3.5 w-3.5" />
                Mitglied seit {new Date(user.createdAt).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-white/[0.08] bg-surface-900 p-6">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <User className="h-5 w-5 text-accent-400" />
          <h2 className="text-lg font-semibold text-white">Profildaten</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-surface-500" />
              Name
            </Label>
            <Input required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          
          <div>
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-surface-500" />
              E-Mail
            </Label>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-surface-500">{user.email}</div>
            <p className="mt-1 text-xs text-surface-600">E-Mail-Adresse kann nicht geändert werden</p>
          </div>

          {(user.isAdmin || user.isPartner || user.website) && (
            <>
              <div className="border-t border-white/[0.06] pt-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-surface-300">
                  <Building2 className="h-4 w-4 text-accent-400" />
                  Veranstalter-Informationen
                </h3>
                
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-surface-500" />
                        Firmenname / Veranstaltungsort
                      </Label>
                      <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="z.B. Kulturhaus Mitte" />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-surface-500" />
                        Webseite
                      </Label>
                      <Input type="url" placeholder="https://…" value={form.website} onChange={(e) => set("website", e.target.value)} />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-surface-500" />
                      Telefon
                    </Label>
                    <Input type="tel" placeholder="+49 …" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-surface-300">
                      <MapPin className="h-4 w-4 text-accent-400" />
                      Adresse
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Straße & Hausnummer</Label>
                        <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Musterstraße 1" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs">PLZ</Label>
                          <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="12345" />
                        </div>
                        <div>
                          <Label className="text-xs">Stadt</Label>
                          <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Berlin" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          {msg && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              <span className="text-lg">✓</span>
              {msg}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <span className="text-lg">✕</span>
              {error}
            </div>
          )}

          <Button type="submit" disabled={busy} className="w-full sm:w-auto">
            {busy ? "Speichere…" : "Profil speichern"}
          </Button>
        </div>
      </form>

      {/* Password Change */}
      <form onSubmit={handlePasswordChange} className="space-y-6 rounded-2xl border border-white/[0.08] bg-surface-900 p-6">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <Lock className="h-5 w-5 text-accent-400" />
          <h2 className="text-lg font-semibold text-white">Passwort ändern</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Aktuelles Passwort</Label>
            <Input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label className="text-xs">Neues Passwort (min. 8 Zeichen)</Label>
            <Input
              type="password"
              required
              minLength={8}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label className="text-xs">Neues Passwort bestätigen</Label>
            <Input
              type="password"
              required
              minLength={8}
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          {pwMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              <span className="text-lg">✓</span>
              {pwMsg}
            </div>
          )}
          {pwError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <span className="text-lg">✕</span>
              {pwError}
            </div>
          )}

          <Button type="submit" disabled={pwBusy} className="w-full sm:w-auto">
            {pwBusy ? "Ändere…" : "Passwort ändern"}
          </Button>
        </div>
      </form>
    </div>
  );
}
