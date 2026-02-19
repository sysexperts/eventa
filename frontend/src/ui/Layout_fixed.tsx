import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-950/95 backdrop-blur-xl border-b border-white/[0.08] shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 text-sm font-black text-white shadow-lg shadow-accent-500/25 ring-2 ring-accent-500/20 backdrop-blur-sm">
                <span className="font-bold">L</span>
              </div>
              <span className="text-xl font-bold text-white">Local<span className="text-accent-400">Events</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                to="/events" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/events') ? 'text-accent-400' : 'text-surface-300 hover:text-white'
                }`}
              >
                Events
              </Link>
              <Link 
                to="/categories" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/categories') ? 'text-accent-400' : 'text-surface-300 hover:text-white'
                }`}
              >
                Kategorien
              </Link>
              <Link 
                to="/artists" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/artists') ? 'text-accent-400' : 'text-surface-300 hover:text-white'
                }`}
              >
                Künstler
              </Link>
              <Link 
                to="/venues" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/venues') ? 'text-accent-400' : 'text-surface-300 hover:text-white'
                }`}
              >
                Locations
              </Link>
              <Link 
                to="/about" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/about') ? 'text-accent-400' : 'text-surface-300 hover:text-white'
                }`}
              >
                Über uns
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-accent-500/30 hover:bg-accent-500/10">
                Anmelden
              </button>
              <button className="rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:shadow-accent-500/40 hover:scale-105">
                Event erstellen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-white/[0.06] bg-gradient-to-b from-surface-950 via-surface-900 to-surface-950">
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-sm font-black text-white shadow-lg shadow-accent-500/25 ring-2 ring-accent-500/20 backdrop-blur-sm">
                  <span className="font-bold">L</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">Local<span className="text-accent-400">Events</span></span>
                  <div className="mt-1 h-0.5 w-12 bg-gradient-to-r from-accent-400 to-neon-purple rounded-full" />
                </div>
              </Link>
              
              <p className="mt-4 text-sm text-surface-400 leading-relaxed max-w-sm">
                Die moderne Plattform für lokale Veranstaltungen. Entdecke Konzerte, Theater, Comedy und mehr in deiner Nähe.
              </p>
              
              {/* Newsletter Signup */}
              <div className="mt-6">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Bleib auf dem Laufenden</h5>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Deine E-Mail"
                      className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-surface-600 outline-none transition-all focus:border-accent-500/50 focus:bg-white/[0.1] focus:ring-2 focus:ring-accent-500/20"
                    />
                    <button className="rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:shadow-accent-500/40 hover:scale-105">
                      Abonnieren
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-4">Entdecken</h4>
              <div className="space-y-3">
                <Link to="/events" className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>🎯</span>
                  <span>Alle Events</span>
                </Link>
                <Link to="/events?category=KONZERT" className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>🎵</span>
                  <span>Konzerte</span>
                </Link>
                <Link to="/events?category=FESTIVAL" className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>🎪</span>
                  <span>Festivals</span>
                </Link>
                <Link to="/events?category=THEATER" className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>🎭</span>
                  <span>Theater</span>
                </Link>
                <Link to="/events?category=COMEDY" className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>😂</span>
                  <span>Comedy</span>
                </Link>
                <Link to="/events?category=FLOHMARKT" className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>🏺</span>
                  <span>Flohmärkte</span>
                </Link>
              </div>
            </div>

            {/* Organizer */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-4">Veranstalter</h4>
              <div className="space-y-3">
                <button className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>🚀</span>
                  <span>Registrieren</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>🔑</span>
                  <span>Anmelden</span>
                </button>
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-surface-500 transition-all duration-200 hover:text-white hover:translate-x-1">
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>

            {/* App Download */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-4">Mobile App</h4>
              <div className="space-y-3">
                <a href="#get-app" className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 backdrop-blur-sm transition-all duration-300 hover:border-accent-500/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-accent-500/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                      <span className="text-white">🍎</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">App Store</div>
                      <div className="text-[10px] text-surface-500">Bald verfügbar</div>
                    </div>
                  </div>
                </a>
                
                <a href="#get-app" className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 backdrop-blur-sm transition-all duration-300 hover:border-neon-purple/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-neon-purple/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                      <span className="text-white">🤖</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Google Play</div>
                      <div className="text-[10px] text-surface-500">Bald verfügbar</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/[0.06] pt-8 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-surface-600">
              <span>&copy; {new Date().getFullYear()} LocalEvents</span>
              <span className="text-surface-700">•</span>
              <span>Alle Rechte vorbehalten</span>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Social Links */}
              <div className="flex gap-4">
                <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-pink-500/50 hover:bg-pink-500/10 hover:scale-110">
                  <span className="text-surface-400 hover:text-white transition-colors">📷</span>
                </a>
                
                <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:scale-110">
                  <span className="text-surface-400 hover:text-white transition-colors">🐦</span>
                </a>
                
                <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-blue-600/50 hover:bg-blue-600/10 hover:scale-110">
                  <span className="text-surface-400 hover:text-white transition-colors">📘</span>
                </a>
              </div>
              
              {/* Legal Links */}
              <div className="flex gap-6 text-xs text-surface-600">
                <Link to="/privacy" className="hover:text-white transition-colors">Datenschutz</Link>
                <Link to="/terms" className="hover:text-white transition-colors">AGB</Link>
                <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
