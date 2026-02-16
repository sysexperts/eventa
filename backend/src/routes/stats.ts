import { Router } from "express";
import { prisma } from "../db.js";

export const statsRouter = Router();

// Public stats endpoint for homepage
statsRouter.get("/public", async (_req, res) => {
  try {
    const now = new Date();
    
    // Count active events (future events)
    const activeEventsCount = await prisma.event.count({
      where: {
        startsAt: {
          gte: now
        }
      }
    });

    // Count total users
    const usersCount = await prisma.user.count();

    // Calculate average artist rating
    const artistStats = await prisma.artist.aggregate({
      where: {
        avgRating: {
          not: null
        }
      },
      _avg: {
        avgRating: true
      },
      _count: {
        id: true
      }
    });

    // Count unique cities from events
    const citiesStats = await prisma.event.groupBy({
      by: ['city'],
      where: {
        startsAt: {
          gte: now
        }
      },
      _count: {
        city: true
      }
    });

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentViews = await prisma.eventView.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    const recentTicketClicks = await prisma.eventTicketClick.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    // Get trending events (most views in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const trendingEvents = await prisma.event.findMany({
      where: {
        startsAt: {
          gte: now
        }
      },
      select: {
        id: true,
        title: true,
        city: true,
        startsAt: true,
        _count: {
          select: {
            views: {
              where: {
                createdAt: {
                  gte: sevenDaysAgo
                }
              }
            }
          }
        }
      },
      orderBy: {
        views: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Get next upcoming event
    const nextEvent = await prisma.event.findFirst({
      where: {
        startsAt: {
          gte: now
        }
      },
      orderBy: {
        startsAt: 'asc'
      },
      select: {
        id: true,
        title: true,
        city: true,
        startsAt: true
      }
    });

    res.json({
      activeEvents: activeEventsCount,
      totalUsers: usersCount,
      avgArtistRating: artistStats._avg.avgRating ? Math.round(artistStats._avg.avgRating * 10) / 10 : 0,
      totalArtists: artistStats._count.id,
      citiesCount: citiesStats.length,
      recentActivity: {
        views24h: recentViews,
        ticketClicks24h: recentTicketClicks
      },
      trendingEvents: trendingEvents.map(e => ({
        id: e.id,
        title: e.title,
        city: e.city,
        startsAt: e.startsAt,
        views: e._count.views
      })),
      nextEvent,
      lastUpdated: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Live activity feed (mock for now, can be enhanced with real activity tracking)
statsRouter.get("/activity", async (_req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get recent event views as activity
    const recentViews = await prisma.eventView.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      },
      select: {
        event: {
          select: {
            title: true,
            city: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get recent ticket clicks as activity
    const recentClicks = await prisma.eventTicketClick.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      },
      select: {
        event: {
          select: {
            title: true,
            city: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Combine and format activities
    const activities = [
      ...recentViews.map(v => ({
        type: 'view',
        eventTitle: v.event.title,
        city: v.event.city,
        timestamp: v.createdAt
      })),
      ...recentClicks.map(c => ({
        type: 'click',
        eventTitle: c.event.title,
        city: c.event.city,
        timestamp: c.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 10);

    res.json({
      activities: activities.map(a => ({
        type: a.type,
        eventTitle: a.eventTitle,
        city: a.city,
        timestamp: a.timestamp,
        timeAgo: getTimeAgo(new Date(a.timestamp))
      }))
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `vor ${diffHours} Std`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `vor ${diffDays} Tagen`;
}
