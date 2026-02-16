import { useEffect, useState } from "react";
import { api } from "../lib/api";

function LiveStatsSection() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await api.stats.getPublic();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-500/[0.02] via-transparent to-neon-purple/[0.02]">
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Warum Local<span className="text-gradient">Events</span>?
            </h2>
            <p className="mt-3 text-sm text-surface-500">
              Die moderne Plattform für lokale Veranstaltungen – entdeckt von Tausenden jeden Tag.
            </p>
          </div>
          <div className="mt-10 text-center text-surface-400">Lade Statistiken...</div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getCountdown = (nextEventStart: string) => {
    const now = new Date();
    const eventTime = new Date(nextEventStart);
    const diff = eventTime.getTime() - now.getTime();
    
    if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

  const countdown = stats.nextEvent ? getCountdown(stats.nextEvent.startsAt) : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent-500/[0.02] via-transparent to-neon-purple/[0.02]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Warum Local<span className="text-gradient">Events</span>?
          </h2>
          <p className="mt-3 text-sm text-surface-500">
            Die moderne Plattform für lokale Veranstaltungen – entdeckt von {formatNumber(stats.totalUsers)} Nutzern.
          </p>
        </div>

        {/* Live Stats Bar */}
        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: stats.activeEvents.toString(), label: "Live Events", change: `+${stats.recentActivity.views24h}`, icon: "🎪" },
              { value: formatNumber(stats.totalUsers), label: "Aktive Nutzer", change: "Online", icon: "👥" },
              { value: stats.avgArtistRating ? `${stats.avgArtistRating}★` : "N/A", label: "Ø Bewertung", change: `${stats.totalArtists} Künstler`, icon: "⭐" },
              { value: stats.citiesCount.toString(), label: "Städte", change: "Deutschlandweit", icon: "🏙️" },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-2xl">{stat.icon}</div>
                <div className="text-2xl font-bold text-white tabular-nums">{stat.value}</div>
                <div className="mt-1 text-xs font-medium text-surface-400">{stat.label}</div>
                <div className="mt-1 text-[10px] font-semibold text-neon-green">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Testimonials */}
        <div className="mt-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white">Was unsere Nutzer sagen</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "Anna R.", text: "Endlich eine übersichtliche Plattform für lokale Events!", rating: 5 },
              { name: "Markus L.", text: "Super einfach, Events zu finden und zu teilen.", rating: 5 },
              { name: "Julia W.", text: "Keine Registrierung nötig – das gefällt mir!", rating: 4 },
            ].map((testimonial, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-xs">⭐</span>
                  ))}
                </div>
                <p className="text-xs text-surface-300 leading-relaxed">"{testimonial.text}"</p>
                <div className="mt-2 text-xs font-medium text-accent-400">{testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LiveStatsSection;
