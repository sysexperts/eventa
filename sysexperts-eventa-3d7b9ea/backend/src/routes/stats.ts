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

    // Calculate average artist rating from reviews
    const artistStats = await prisma.artistReview.aggregate({
      _avg: {
        rating: true
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

    // Get recent activity (last 24 hours) - only views, no ticket clicks
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentViews = await prisma.eventView.count({
      where: {
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    const recentActivity = await prisma.eventView.findMany({
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

    // Get trending events (most views in last 7 days) - only views, no ticket clicks
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
      avgArtistRating: artistStats._avg.rating ? Math.round(artistStats._avg.rating * 10) / 10 : 0,
      totalArtists: artistStats._count.id,
      citiesCount: citiesStats.length,
      recentActivity: {
        views24h: recentViews
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

// Live activity feed - only views, no ticket clicks
statsRouter.get("/activity", async (_req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get recent event views as activity - only views, no ticket clicks
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

    // Format activities - only views, no ticket clicks
    const activities = recentViews.map(v => ({
      type: 'view' as const,
      eventTitle: v.event.title,
      city: v.event.city,
      timestamp: v.createdAt,
      timeAgo: getTimeAgo(new Date(v.createdAt))
    }));

    res.json({
      activities
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
