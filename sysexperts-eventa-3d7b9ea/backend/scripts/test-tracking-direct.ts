import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Teste direktes Tracking...\n");

  const eventId = "cmlxzay050002nt8ylfxdhiy9";
  
  // Test: Event existiert?
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true }
  });
  
  if (!event) {
    console.log("❌ Event nicht gefunden!");
    return;
  }
  
  console.log(`✓ Event gefunden: ${event.title}`);
  
  // Test: EventView erstellen
  console.log("\n📝 Erstelle EventView...");
  try {
    const view = await prisma.eventView.create({
      data: { eventId: event.id }
    });
    console.log(`✓ EventView erstellt: ${view.id}`);
  } catch (err) {
    console.error("❌ Fehler beim Erstellen:", err);
  }
  
  // Test: Zählen
  const count = await prisma.eventView.count();
  console.log(`\n📊 Gesamt EventViews: ${count}`);
}

main()
  .catch((e) => {
    console.error("❌ Fehler:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
