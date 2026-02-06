const CATEGORY_LABELS: Record<string, string> = {
  // Musik & Bühne
  KONZERT: "Konzert",
  FESTIVAL: "Festival",
  MUSICAL: "Musical",
  OPER: "Oper",
  KABARETT: "Kabarett",
  OPEN_MIC: "Open Mic",
  DJ_EVENT: "DJ Event",
  // Bühne & Darstellung
  THEATER: "Theater",
  COMEDY: "Comedy",
  TANZ: "Tanz",
  ZAUBERSHOW: "Zaubershow",
  // Kunst & Kultur
  AUSSTELLUNG: "Ausstellung",
  LESUNG: "Lesung",
  FILM: "Film",
  FOTOGRAFIE: "Fotografie",
  MUSEUM: "Museum",
  // Märkte & Messen
  FLOHMARKT: "Flohmarkt",
  WOCHENMARKT: "Wochenmarkt",
  WEIHNACHTSMARKT: "Weihnachtsmarkt",
  MESSE: "Messe",
  FOOD_FESTIVAL: "Food Festival",
  // Sport & Fitness
  SPORT: "Sport",
  LAUF: "Lauf",
  TURNIER: "Turnier",
  YOGA: "Yoga",
  WANDERUNG: "Wanderung",
  // Familie & Kinder
  KINDERTHEATER: "Kindertheater",
  FAMILIENTAG: "Familientag",
  KINDER_WORKSHOP: "Kinder-Workshop",
  // Essen & Trinken
  WEINPROBE: "Weinprobe",
  CRAFT_BEER: "Craft Beer",
  KOCHKURS: "Kochkurs",
  FOOD_TRUCK: "Food Truck",
  KULINARISCHE_TOUR: "Kulinarische Tour",
  // Bildung & Networking
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  KONFERENZ: "Konferenz",
  NETWORKING: "Networking",
  VORTRAG: "Vortrag",
  // Nachtleben & Party
  CLUBNACHT: "Clubnacht",
  KARAOKE: "Karaoke",
  PARTY: "Party",
  // Saisonales & Feste
  KARNEVAL: "Karneval",
  OKTOBERFEST: "Oktoberfest",
  SILVESTER: "Silvester",
  STADTFEST: "Stadtfest",
  STRASSENFEST: "Straßenfest",
  // Sonstiges
  SONSTIGES: "Sonstiges",
};

export function categoryLabel(c: string) {
  return CATEGORY_LABELS[c] ?? c;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
