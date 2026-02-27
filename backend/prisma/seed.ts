import bcrypt from "bcryptjs";
import { PrismaClient, EventCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // ─── Create Admin User ───────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@local-events.de" },
    update: {},
    create: {
      email: "admin@local-events.de",
      passwordHash,
      name: "Admin",
      isAdmin: true,
    }
  });

  // ─── Seed culture communities ────────────────────────────────────────────────
  const cultures = [
    { slug: "turkish", name: "Türkisch", flagCode: "tr", bannerUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=80" },
    { slug: "greek", name: "Griechisch", flagCode: "gr", bannerUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80" },
    { slug: "romanian", name: "Rumänisch", flagCode: "ro", bannerUrl: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=600&q=80" },
    { slug: "arabic", name: "Arabisch", flagCode: "sa", bannerUrl: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=600&q=80" },
    { slug: "polish", name: "Polnisch", flagCode: "pl", bannerUrl: "https://images.unsplash.com/photo-1607427293702-036707e560d7?auto=format&fit=crop&w=600&q=80" },
    { slug: "italian", name: "Italienisch", flagCode: "it", bannerUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=600&q=80" },
    { slug: "balkan", name: "Balkan", flagCode: "rs", bannerUrl: "https://images.unsplash.com/photo-1555990538-1e15a2d6b7a3?auto=format&fit=crop&w=600&q=80" },
    { slug: "latin", name: "Lateinamerika", flagCode: "br", bannerUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80" },
    { slug: "african", name: "Afrikanisch", flagCode: "ng", bannerUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80" },
    { slug: "persian", name: "Persisch", flagCode: "ir", bannerUrl: "https://images.unsplash.com/photo-1565711561500-49678a10a63f?auto=format&fit=crop&w=600&q=80" },
    { slug: "kurdish", name: "Kurdisch", flagCode: "iq", bannerUrl: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=600&q=80" },
    { slug: "russian", name: "Russisch", flagCode: "ru", bannerUrl: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=600&q=80" },
    { slug: "spanish", name: "Spanisch", flagCode: "es", bannerUrl: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=600&q=80" },
    { slug: "portuguese", name: "Portugiesisch", flagCode: "pt", bannerUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=600&q=80" },
    { slug: "asian", name: "Asiatisch", flagCode: "cn", bannerUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=600&q=80" },
    { slug: "international", name: "International", flagCode: "eu", bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" },
  ];

  for (const c of cultures) {
    await prisma.community.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        name: c.name,
        flagCode: c.flagCode,
        bannerUrl: c.bannerUrl,
        showOnHomepage: true,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${cultures.length} culture communities.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
