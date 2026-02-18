import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { AuthModal } from "./AuthModal";
function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative text-[13px] font-medium tracking-wide uppercase transition-all duration-300 py-1 ${
          isActive
            ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-accent-400 after:to-neon-purple"
            : "text-surface-400 hover:text-white after:absolute after:bottom-0 after:left-1/2 after:right-1/2 after:h-[2px] after:rounded-full after:bg-accent-500/60 after:transition-all after:duration-300 hover:after:left-0 hover:after:right-0"
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
            <a href="#get-app" className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              Get App
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-950/60 backdrop-blur-2xl backdrop-saturate-150">
        {/* Animated gradient border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent animate-gradient-x" style={{ backgroundSize: "200% 100%" }} />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-sm font-black text-white shadow-lg shadow-accent-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-accent-500/50 group-hover:rotate-3">
              <div className="absolute inset-0 rounded-xl bg-accent-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">L</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Local<span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">Events</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            <NavItem to="/events" label="Events" />
            {user && <NavItem to="/favorites" label="Favoriten" />}
            {user && (user.isAdmin || user.isPartner || user.website) && <NavItem to="/my-events" label="Meine Events" />}
            {user && (user.isAdmin || user.isPartner || user.website) && <NavItem to="/dashboard" label="Dashboard" />}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Get App Button - always visible */}
            <a
              href="#get-app"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-surface-300 transition-all duration-300 hover:bg-white/10 hover:border-accent-500/30 hover:text-white hover:shadow-lg hover:shadow-accent-500/5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              Get App
            </a>

            {/* Auth buttons - desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="group relative flex items-center gap-3">
                  <div className="flex items-center gap-2.5 cursor-pointer">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-400/30 to-accent-600/20 text-xs font-bold text-accent-300 ring-2 ring-accent-500/20 transition-all duration-300 group-hover:ring-accent-500/40 group-hover:shadow-lg group-hover:shadow-accent-500/10">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-surface-300 group-hover:text-white transition-colors duration-200">{user.name}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-500 group-hover:text-white transition-all duration-200 group-hover:translate-y-0.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {/* Hover dropdown */}
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-surface-900 py-1.5 shadow-xl shadow-black/30">
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
              ) : (
                <>
                  <button onClick={openLogin} className="px-3 py-2 text-sm font-medium text-surface-400 transition-all duration-200 hover:text-white">
                    Anmelden
                  </button>
                  <button
                    onClick={openRegister}
                    className="relative rounded-full bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:shadow-accent-500/40 hover:scale-[1.03] active:scale-[0.98] overflow-hidden group/btn"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <span className="relative">Registrieren</span>
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
              </div>
            </div>

            {/* Get App CTA */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">App holen</h4>
              <div className="mt-3 space-y-2">
                <a href="#get-app" className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <div>
                    <div className="text-[10px] text-surface-500">Bald verfügbar</div>
                    <div className="text-xs font-semibold text-white">App Store</div>
                  </div>
                </a>
                <a href="#get-app" className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                  <div>
                    <div className="text-[10px] text-surface-500">Bald verfügbar</div>
                    <div className="text-xs font-semibold text-white">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row">
            <p className="text-xs text-surface-600">&copy; {new Date().getFullYear()} LocalEvents. Alle Rechte vorbehalten.</p>
            <div className="flex gap-4">
              <a href="#" className="text-surface-600 hover:text-white transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="text-surface-600 hover:text-white transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
