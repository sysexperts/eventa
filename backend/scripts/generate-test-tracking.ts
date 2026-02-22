import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Generiere Test-Tracking-Daten...\n");

  const events = await prisma.event.findMany({
    select: { id: true, title: true }
  });

  if (events.length === 0) {
    console.log("❌ Keine Events gefunden!");
    return;
  }

  const now = new Date();
  
  for (const event of events) {
    // Generate random views (between 50-200)
    const viewCount = Math.floor(Math.random() * 150) + 50;
    
    // Generate random clicks (between 5-30% of views)
    const clickCount = Math.floor(viewCount * (Math.random() * 0.25 + 0.05));

    console.log(`${event.title}:`);
    console.log(`  Generiere ${viewCount} Views...`);
    
    // Create views over the last 30 days
    for (let i = 0; i < viewCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);
      
      await prisma.eventView.create({
        data: {
          eventId: event.id,
          createdAt
        }
      });
    }

    console.log(`  Generiere ${clickCount} Ticket-Klicks...`);
    
    // Create ticket clicks
    for (let i = 0; i < clickCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);
      
      await prisma.eventTicketClick.create({
        data: {
          eventId: event.id,
          createdAt
        }
      });
    }

    console.log(`  ✓ ${viewCount} Views und ${clickCount} Clicks erstellt\n`);
  }

  console.log("✅ Test-Tracking-Daten erfolgreich generiert!");
  
  // Show summary
  const totalViews = await prisma.eventView.count();
  const totalClicks = await prisma.eventTicketClick.count();
  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;
  
  console.log("\n📈 Zusammenfassung:");
  console.log(`Total Views: ${totalViews}`);
  console.log(`Total Clicks: ${totalClicks}`);
  console.log(`Conversion Rate: ${conversionRate}%`);
}

main()
  .catch((e) => {
    console.error("❌ Fehler:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
