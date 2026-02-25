import bcrypt from "bcryptjs";
import { PrismaClient, EventCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const organizer = await prisma.user.upsert({
    where: { email: "demo@veranstalter.de" },
    update: {},
    create: {
      email: "demo@veranstalter.de",
      passwordHash,
      name: "Demo Veranstalter",
      website: "https://example.com"
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

  const count = await prisma.event.count({ where: { organizerId: organizer.id } });
  if (count > 0) return;

  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  await prisma.event.createMany({
    data: [
      {
        title: "Indie Konzert Abend",
        shortDescription: "Drei Bands, ein Abend, gute Stimmung im Kreuzberger Keller.",
        description:
          "Ein gemütlicher Indie-Abend mit drei lokalen Bands aus Berlin. Einlass ab 19:00, Beginn 20:00. Es gibt eine kleine Bar mit Craft-Bier und Snacks. Der Eintritt ist frei – Spenden für die Künstler sind willkommen.\n\nLineup:\n• The Velvet Echoes (Indie Rock)\n• Mondlicht (Dream Pop)\n• Kiezklang (Folk Punk)\n\nKommt vorbei und unterstützt die lokale Musikszene!",
        category: EventCategory.KONZERT,
        startsAt: inDays(3),
        endsAt: new Date(inDays(3).getTime() + 4 * 60 * 60 * 1000),
        address: "Oranienstraße 25",
        city: "Berlin",
        country: "DE",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
        ticketUrl: "https://www.eventbrite.de",
        price: "Kostenlos",
        tags: ["Live-Musik", "Indie", "Kreuzberg", "Barrierefrei"],
        isFeatured: true,
        organizerId: organizer.id
      },
      {
        title: "Theater: Der Besuch der alten Dame",
        shortDescription: "Dürrenmatts Klassiker in einer modernen, packenden Neuinszenierung.",
        description:
          "Eine moderne Inszenierung von Friedrich Dürrenmatts Meisterwerk mit dem Ensemble des Thalia Theaters. Nach der Vorstellung gibt es eine offene Diskussionsrunde mit dem Regisseur im Foyer.\n\nDauer: ca. 2,5 Stunden inkl. Pause\nAltersempfehlung: ab 14 Jahren\n\nTickets sind begrenzt – frühzeitig sichern!",
        category: EventCategory.THEATER,
        startsAt: inDays(7),
        endsAt: new Date(inDays(7).getTime() + 2.5 * 60 * 60 * 1000),
        address: "Theaterplatz 1",
        city: "Hamburg",
        country: "DE",
        imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80",
        ticketUrl: "https://www.eventim.de",
        price: "Ab 18 €",
        tags: ["Klassiker", "Neuinszenierung", "Diskussion"],
        isFeatured: false,
        organizerId: organizer.id
      },
      {
        title: "Lesung & Gespräch: Zukunft der KI",
        shortDescription: "Bestsellerautorin liest aus ihrem neuen Buch und beantwortet eure Fragen.",
        description:
          "Die Autorin Dr. Lena Hartmann liest aus ihrem neuen Bestseller 'Morgen denkt die Maschine' und spricht ueber Chancen, Risiken und ethische Fragen rund um Kuenstliche Intelligenz.\n\nIm Anschluss: Q&A mit dem Publikum und Signierstunde.\n\nGetraenke und Snacks vor Ort verfuegbar. Der Eintritt ist frei, eine Anmeldung wird empfohlen.",
        category: EventCategory.LESUNG,
        startsAt: inDays(10),
        endsAt: new Date(inDays(10).getTime() + 2 * 60 * 60 * 1000),
        address: "Bibliotheksweg 5",
        city: "München",
        country: "DE",
        imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
        price: "Kostenlos",
        tags: ["KI", "Sachbuch", "Q&A", "Signierstunde"],
        isFeatured: false,
        organizerId: organizer.id
      },
      {
        title: "Stand-Up Comedy Night",
        shortDescription: "Fünf Comedians, ein Abend voller Lacher – hosted by Max Müller.",
        description:
          "Die monatliche Comedy Night im Quatsch Comedy Club ist zurück! Fünf aufstrebende Comedians aus ganz Deutschland präsentieren ihre besten Sets.\n\nHost: Max Müller\nLineup wird eine Woche vorher bekannt gegeben.\n\n2-Drink-Minimum. Einlass ab 19:30, Show um 20:00.",
        category: EventCategory.COMEDY,
        startsAt: inDays(5),
        endsAt: new Date(inDays(5).getTime() + 2.5 * 60 * 60 * 1000),
        address: "Friedrichstraße 107",
        city: "Berlin",
        country: "DE",
        imageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&q=80",
        ticketUrl: "https://www.eventbrite.de",
        price: "12 €",
        tags: ["Stand-Up", "Nachtleben", "Drinks"],
        isFeatured: true,
        organizerId: organizer.id
      },
      {
        title: "Flohmarkt am Mauerpark",
        shortDescription: "Berlins beliebtester Flohmarkt – Vintage, Kunst, Street Food und Karaoke.",
        description:
          "Jeden Sonntag verwandelt sich der Mauerpark in einen riesigen Flohmarkt mit hunderten Ständen. Findet Vintage-Kleidung, Schallplatten, handgemachte Kunst und vieles mehr.\n\nHighlights:\n• Bearpit Karaoke ab 15:00\n• Street Food aus aller Welt\n• Live-Musik im Park\n\nEintritt frei. Hunde willkommen!",
        category: EventCategory.SONSTIGES,
        startsAt: inDays(2),
        endsAt: new Date(inDays(2).getTime() + 6 * 60 * 60 * 1000),
        address: "Bernauer Str. 63-64",
        city: "Berlin",
        country: "DE",
        imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200&q=80",
        price: "Kostenlos",
        tags: ["Outdoor", "Familienfreundlich", "Street Food", "Vintage"],
        isFeatured: false,
        organizerId: organizer.id
      },
      {
        title: "Jazz im Birdland",
        shortDescription: "Erstklassiger Jazz in intimer Club-Atmosphäre mit dem Trio Ellington.",
        description:
          "Das Trio Ellington spielt eine Hommage an die großen Jazz-Standards der 50er und 60er Jahre. Genießt erstklassige Musik bei Cocktails und Fingerfood in Hamburgs schönstem Jazz-Club.\n\nReservierung empfohlen – begrenzte Plätze!\n\nSet 1: 20:00 – 21:15\nSet 2: 21:45 – 23:00",
        category: EventCategory.KONZERT,
        startsAt: inDays(14),
        endsAt: new Date(inDays(14).getTime() + 3 * 60 * 60 * 1000),
        address: "Gänsemarkt 45",
        city: "Hamburg",
        country: "DE",
        imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=1200&q=80",
        ticketUrl: "https://www.eventim.de",
        price: "Ab 25 €",
        tags: ["Jazz", "Live-Musik", "Cocktails", "Intimate"],
        isFeatured: false,
        organizerId: organizer.id
      }
    ]
  });
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
