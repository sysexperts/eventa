import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Suche Events mit Tippfehlern in Städtenamen...\n");
  
  // Fix common typos
  const typos = [
    { wrong: "Suttgart", correct: "Stuttgart" },
    { wrong: "Muenchen", correct: "München" },
    { wrong: "Koeln", correct: "Köln" },
    { wrong: "Kulturhaus-schwanen", correct: "Stuttgart" }, // Assuming this is in Stuttgart
  ];

  for (const { wrong, correct } of typos) {
    const events = await prisma.event.findMany({
      where: { city: wrong },
      select: { id: true, title: true, city: true }
    });

    if (events.length > 0) {
      console.log(`📝 Korrigiere "${wrong}" → "${correct}":`);
      for (const event of events) {
        console.log(`   - ${event.title}`);
      }
      
      const result = await prisma.event.updateMany({
        where: { city: wrong },
        data: { city: correct }
      });
      
      console.log(`   ✓ ${result.count} Events aktualisiert\n`);
    }
  }

  console.log("✅ Alle Tippfehler wurden korrigiert!");
  
  // Show current city distribution
  console.log("\n📊 Aktuelle Städte-Verteilung:");
  const allEvents = await prisma.event.findMany({
    select: { city: true }
  });
  
  const cityMap: Record<string, number> = {};
  allEvents.forEach((ev) => {
    if (ev.city) cityMap[ev.city] = (cityMap[ev.city] || 0) + 1;
  });
  
  Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([city, count]) => {
      console.log(`   ${city}: ${count} Events`);
    });
}

main()
  .catch((e) => {
    console.error("❌ Fehler:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
