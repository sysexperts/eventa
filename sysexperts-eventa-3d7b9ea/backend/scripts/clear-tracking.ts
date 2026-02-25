import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Lösche alle Tracking-Daten...\n");

  const deletedViews = await prisma.eventView.deleteMany({});
  console.log(`✓ ${deletedViews.count} EventViews gelöscht`);

  const deletedClicks = await prisma.eventTicketClick.deleteMany({});
  console.log(`✓ ${deletedClicks.count} EventTicketClicks gelöscht`);

  console.log("\n✅ Alle Tracking-Daten wurden gelöscht!");
  console.log("📊 Dashboard startet jetzt von 0.");
}

main()
  .catch((e) => {
    console.error("❌ Fehler:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
