import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Suche Demo-User...");
  
  // Find demo user (usually demo@example.com or similar)
  const demoUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "demo" } },
        { email: { contains: "example" } },
        { email: { contains: "test" } },
        { name: { contains: "Demo" } },
        { name: { contains: "Test" } },
      ]
    },
    include: {
      _count: {
        select: {
          events: true,
          scrapedEvents: true,
        }
      }
    }
  });

  if (demoUsers.length === 0) {
    console.log("✅ Keine Demo-User gefunden.");
    return;
  }

  console.log(`\n📋 Gefundene Demo-User:\n`);
  demoUsers.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.name} (${user.email})`);
    console.log(`   - Events: ${user._count.events}`);
    console.log(`   - Scraped Events: ${user._count.scrapedEvents}`);
  });

  console.log("\n🗑️  Lösche Demo-User und ihre Events...\n");

  for (const user of demoUsers) {
    console.log(`Lösche User: ${user.name} (${user.email})`);
    
    // Delete all events created by this user
    const deletedEvents = await prisma.event.deleteMany({
      where: { organizerId: user.id }
    });
    console.log(`  ✓ ${deletedEvents.count} Events gelöscht`);

    // Delete all scraped events
    const deletedScraped = await prisma.scrapedEvent.deleteMany({
      where: { organizerId: user.id }
    });
    console.log(`  ✓ ${deletedScraped.count} Scraped Events gelöscht`);

    // Delete user
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`  ✓ User gelöscht\n`);
  }

  console.log("✅ Alle Demo-User und ihre Events wurden gelöscht!");
}

main()
  .catch((e) => {
    console.error("❌ Fehler:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
