import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Überprüfe Tracking-Daten...\n");

  const viewCount = await prisma.eventView.count();
  const clickCount = await prisma.eventTicketClick.count();
  
  console.log(`EventViews: ${viewCount}`);
  console.log(`TicketClicks: ${clickCount}\n`);

  if (viewCount === 0) {
    console.log("⚠️  Keine Views vorhanden - Tracking funktioniert möglicherweise nicht!");
  }

  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          views: true,
          ticketClicks: true
        }
      }
    }
  });

  console.log("📋 Events mit Tracking-Daten:\n");
  events.forEach(ev => {
    console.log(`${ev.title}:`);
    console.log(`  Views: ${ev._count.views}`);
    console.log(`  Clicks: ${ev._count.ticketClicks}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Fehler:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
