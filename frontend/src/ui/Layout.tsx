import { useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { api, type User } from "../lib/api";
import { AuthModal } from "./AuthModal";
import { CookieBanner } from "./CookieBanner";

function UserDropdown({ user, refresh, logout, navigate }: { user: User; refresh: () => Promise<void>; logout: () => Promise<void>; navigate: ReturnType<typeof useNavigate> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      await api.me.uploadAvatar(file);
      await refresh();
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const renderAvatar = () => {
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-accent-500/20 transition-all duration-300 group-hover:ring-accent-500/40"
        />
      );
    }
    return (
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-400/30 to-accent-600/20 text-xs font-bold text-accent-300 ring-2 ring-accent-500/20 transition-all duration-300 group-hover:ring-accent-500/40 group-hover:shadow-lg group-hover:shadow-accent-500/10">
        {user.name?.charAt(0).toUpperCase() || "U"}
      </div>
    );
  };

  return (
    <div className="group relative flex items-center gap-3">
      <div className="flex items-center gap-2.5 cursor-pointer">
        {renderAvatar()}
        <span className="text-sm font-medium text-surface-300 group-hover:text-white transition-colors duration-200">{user.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-500 group-hover:text-white transition-all duration-200 group-hover:translate-y-0.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {/* Hover dropdown */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-surface-900 py-2 shadow-xl shadow-black/30">
        {/* Avatar Preview and Upload */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            {renderAvatar()}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-surface-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2 w-full rounded-lg bg-accent-500/20 px-3 py-1.5 text-xs font-medium text-accent-300 hover:bg-accent-500/30 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Lädt..." : "Profilbild ändern"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
              e.target.value = "";
            }}
          />
        </div>

        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm text-surface-300 hover:text-white hover:bg-white/5 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profil
        </Link>
        {user?.isAdmin && (
          <>
            <div className="my-1 border-t border-white/[0.06]"/>
            <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Admin-Bereich
            </Link>
            <Link to="/admin/spotify-import" className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              Spotify Import
            </Link>
          </>
        )}
        <div className="my-1 border-t border-white/[0.06]"/>
        <button
          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-surface-400 hover:text-neon-pink hover:bg-white/5 transition-colors"
          onClick={async () => { await logout(); navigate("/"); }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Abmelden
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative rounded-full px-4 py-1.5 text-[13px] font-medium tracking-wide transition-all duration-200 ${
          isActive
            ? "bg-white/10 text-white shadow-inner shadow-white/5 ring-1 ring-white/10"
            : "text-surface-400 hover:text-white hover:bg-white/[0.06]"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-72 bg-surface-900 p-6 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="mb-8 text-surface-400 hover:text-white">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <nav className="flex flex-col gap-4">
          <NavLink to="/events" onClick={onClose} className="text-base font-medium text-surface-300 hover:text-white transition-colors">Events</NavLink>
          <NavLink to="/artists" onClick={onClose} className="text-base font-medium text-surface-300 hover:text-white transition-colors">Künstler</NavLink>
          {user ? (
            <>
              <NavLink to="/favorites" onClick={onClose} className="text-base font-medium text-surface-300 hover:text-white transition-colors">Favoriten</NavLink>
              {(user.isAdmin || user.isPartner || user.website) && (
                <NavLink to="/my-events" onClick={onClose} className="text-base font-medium text-surface-300 hover:text-white transition-colors">Meine Events</NavLink>
              )}
              {(user.isAdmin || user.isPartner || user.website) && (
                <NavLink to="/dashboard" onClick={onClose} className="text-base font-medium text-surface-300 hover:text-white transition-colors">Dashboard</NavLink>
              )}
              <NavLink to="/profile" onClick={onClose} className="text-base font-medium text-surface-300 hover:text-white transition-colors">Profil</NavLink>
              {user?.isAdmin && (
                <NavLink to="/admin" onClick={onClose} className="text-base font-medium text-red-400 hover:text-red-300 transition-colors">Admin-Bereich</NavLink>
              )}
              <button
                className="mt-4 text-left text-sm text-surface-500 hover:text-neon-pink transition-colors"
                onClick={async () => { await logout(); navigate("/"); onClose(); }}
              >
                Abmelden
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { onClose(); openLogin(); }} className="text-left text-base font-medium text-surface-300 hover:text-white transition-colors">Anmelden</button>
              <button onClick={() => { onClose(); openRegister(); }} className="mt-2 block rounded-xl bg-accent-500 px-4 py-3 text-center text-sm font-semibold text-white">
                Registrieren
              </button>
            </>
          )}
          <div className="mt-6 border-t border-surface-800 pt-6">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-surface-500 cursor-default select-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              App – bald verfügbar
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, openLogin, openRegister, refresh } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* ── Global ambient background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-surface-950" aria-hidden="true">
        <div className="absolute -left-[20vw] top-[5vh] h-[60vh] w-[60vw] rounded-full bg-accent-500/20 blur-[100px]" />
        <div className="absolute -right-[15vw] top-[30vh] h-[50vh] w-[50vw] rounded-full bg-neon-purple/15 blur-[90px]" />
        <div className="absolute left-[15vw] bottom-[0vh] h-[40vh] w-[40vw] rounded-full bg-neon-cyan/10 blur-[90px]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-surface-950 to-transparent" />
      </div>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-surface-950/75 backdrop-blur-3xl backdrop-saturate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <span className="bg-gradient-to-r from-[#00e5ff] to-[#0066ff] bg-clip-text text-transparent">o</span>
              <span className="text-white">mekan</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <NavItem to="/events" label="Events" />
            <NavItem to="/artists" label="Künstler" />
            {user && <NavItem to="/favorites" label="Favoriten" />}
            {user && (user.isAdmin || user.isPartner || user.website) && <NavItem to="/my-events" label="Meine Events" />}
            {user && (user.isAdmin || user.isPartner || user.website) && <NavItem to="/dashboard" label="Dashboard" />}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Get App Button - coming soon */}
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/[0.05] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-surface-500 cursor-default select-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              App bald
            </span>

            {/* Auth buttons - desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <UserDropdown user={user} refresh={refresh} logout={logout} navigate={navigate} />
              ) : (
                <>
                  <button onClick={openLogin} className="rounded-full px-4 py-1.5 text-[13px] font-medium text-surface-400 transition-all duration-200 hover:text-white hover:bg-white/[0.06]">
                    Anmelden
                  </button>
                  <button
                    onClick={openRegister}
                    className="rounded-full bg-gradient-to-r from-accent-500 to-purple-600 px-4 py-1.5 text-[13px] font-semibold text-white shadow-md shadow-accent-500/30 transition-all duration-200 hover:from-accent-400 hover:to-purple-500 hover:shadow-accent-500/50 active:scale-[0.97]"
                  >
                    Registrieren
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 hover:text-white lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <AuthModal />

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-xs font-black text-white">L</div>
                <span className="text-base font-bold text-white">Local<span className="text-accent-400">Events</span></span>
              </Link>
              <p className="mt-3 text-sm text-surface-500 leading-relaxed">
                Entdecke lokale Veranstaltungen in deiner Nähe. Konzerte, Theater, Comedy und mehr.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">Entdecken</h4>
              <div className="mt-3 flex flex-col gap-2">
                <Link to="/events" className="text-sm text-surface-500 hover:text-white transition-colors">Alle Events</Link>
                <Link to="/events?category=KONZERT" className="text-sm text-surface-500 hover:text-white transition-colors">Konzerte</Link>
                <Link to="/events?category=FESTIVAL" className="text-sm text-surface-500 hover:text-white transition-colors">Festivals</Link>
                <Link to="/events?category=THEATER" className="text-sm text-surface-500 hover:text-white transition-colors">Theater</Link>
                <Link to="/events?category=COMEDY" className="text-sm text-surface-500 hover:text-white transition-colors">Comedy</Link>
                <Link to="/events?category=FLOHMARKT" className="text-sm text-surface-500 hover:text-white transition-colors">Flohmärkte</Link>
                <Link to="/events?category=PARTY" className="text-sm text-surface-500 hover:text-white transition-colors">Partys</Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">Veranstalter</h4>
              <div className="mt-3 flex flex-col gap-2">
                <button onClick={openRegister} className="text-left text-sm text-surface-500 hover:text-white transition-colors">Registrieren</button>
                <button onClick={openLogin} className="text-left text-sm text-surface-500 hover:text-white transition-colors">Anmelden</button>
                <Link to="/dashboard" className="text-sm text-surface-500 hover:text-white transition-colors">Dashboard</Link>
                <Link to="/kontakt" className="text-sm text-surface-500 hover:text-white transition-colors">Kontakt</Link>
              </div>
            </div>

            {/* Get App CTA */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">App holen</h4>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 cursor-default opacity-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-surface-500"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <div>
                    <div className="text-[10px] text-surface-500">Bald verfügbar</div>
                    <div className="text-xs font-semibold text-surface-400">App Store</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 cursor-default opacity-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-surface-500"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                  <div>
                    <div className="text-[10px] text-surface-500">Bald verfügbar</div>
                    <div className="text-xs font-semibold text-surface-400">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row">
            <p className="text-xs text-surface-600">&copy; {new Date().getFullYear()} LocalEvents. Alle Rechte vorbehalten.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link to="/kontakt" className="text-xs text-surface-500 hover:text-white transition-colors">Kontakt</Link>
              <Link to="/impressum" className="text-xs text-surface-500 hover:text-white transition-colors">Impressum</Link>
              <Link to="/datenschutz" className="text-xs text-surface-500 hover:text-white transition-colors">Datenschutz</Link>
              <Link to="/agb" className="text-xs text-surface-500 hover:text-white transition-colors">AGB</Link>
              <Link to="/barrierefreiheit" className="text-xs text-surface-500 hover:text-white transition-colors">Barrierefreiheit</Link>
            </div>
          </div>
        </div>
      </footer>
      <CookieBanner />
    </div>
  );
}
