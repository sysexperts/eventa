/**
 * Auto-categorize events based on title and description keywords.
 * Returns the best matching EventCategory or "SONSTIGES" as fallback.
 */

type EventCategory =
  | "KONZERT" | "FESTIVAL" | "MUSICAL" | "OPER" | "KABARETT" | "OPEN_MIC" | "DJ_EVENT"
  | "THEATER" | "COMEDY" | "TANZ" | "ZAUBERSHOW"
  | "AUSSTELLUNG" | "LESUNG" | "FILM" | "FOTOGRAFIE" | "MUSEUM"
  | "FLOHMARKT" | "WOCHENMARKT" | "WEIHNACHTSMARKT" | "MESSE" | "FOOD_FESTIVAL"
  | "SPORT" | "LAUF" | "TURNIER" | "YOGA" | "WANDERUNG"
  | "KINDERTHEATER" | "FAMILIENTAG" | "KINDER_WORKSHOP"
  | "WEINPROBE" | "CRAFT_BEER" | "KOCHKURS" | "FOOD_TRUCK" | "KULINARISCHE_TOUR"
  | "WORKSHOP" | "SEMINAR" | "KONFERENZ" | "NETWORKING" | "VORTRAG"
  | "CLUBNACHT" | "KARAOKE" | "PARTY"
  | "KARNEVAL" | "OKTOBERFEST" | "SILVESTER" | "STADTFEST" | "STRASSENFEST"
  | "SONSTIGES";

type Rule = { category: EventCategory; keywords: RegExp[]; weight: number };

const RULES: Rule[] = [
  // Musik & Bühne (check specific before generic)
  { category: "OPER", keywords: [/\boper\b/i, /\boperette\b/i, /\bopern/i], weight: 10 },
  { category: "MUSICAL", keywords: [/\bmusical\b/i], weight: 10 },
  { category: "KABARETT", keywords: [/\bkabarett\b/i, /\bkleinkunst\b/i], weight: 10 },
  { category: "OPEN_MIC", keywords: [/\bopen\s*mic\b/i, /\bopen\s*stage\b/i, /\boffene\s*b[üu]hne\b/i], weight: 10 },
  { category: "DJ_EVENT", keywords: [/\bdj\b/i, /\belectronic\b/i, /\btechno\b/i, /\bhouse\s*music\b/i], weight: 8 },
  { category: "FESTIVAL", keywords: [/\bfestival\b/i, /\bfest\b(?!.*markt)/i, /\bopen\s*air\b/i], weight: 9 },
  { category: "KONZERT", keywords: [/\bkonzert\b/i, /\bconcert\b/i, /\blive\s*musik\b/i, /\blive\s*music\b/i, /\bband\b/i, /\btour\s*20\d{2}\b/i, /\bsinfonie\b/i, /\borchester\b/i, /\bchor\b/i, /\ba\s*cappella\b/i], weight: 7 },

  // Bühne & Show
  { category: "ZAUBERSHOW", keywords: [/\bzauber/i, /\bmagie\b/i, /\bmagier\b/i, /\billusion/i], weight: 10 },
  { category: "TANZ", keywords: [/\btanz\b/i, /\btanzen\b/i, /\bballett\b/i, /\bdance\b/i, /\bflamenco\b/i, /\bsalsa\b/i, /\btango\b/i], weight: 9 },
  { category: "COMEDY", keywords: [/\bcomedy\b/i, /\bstand[\s-]*up\b/i, /\bkabarettist/i, /\bcomedian\b/i, /\bhumor\b/i, /\bsatire\b/i], weight: 9 },
  { category: "THEATER", keywords: [/\btheater\b/i, /\btheatre\b/i, /\bschauspiel\b/i, /\binszenierung\b/i, /\bpremiere\b/i, /\bst[üu]ck\b/i, /\bauff[üu]hrung\b/i], weight: 7 },

  // Kunst & Kultur
  { category: "FOTOGRAFIE", keywords: [/\bfotografie\b/i, /\bfotoausstellung\b/i, /\bphotography\b/i], weight: 10 },
  { category: "MUSEUM", keywords: [/\bmuseum\b/i, /\bmuseen\b/i], weight: 10 },
  { category: "FILM", keywords: [/\bfilm\b/i, /\bkino\b/i, /\bscreening\b/i, /\bdokumentarfilm\b/i, /\bopen[\s-]*air[\s-]*kino\b/i], weight: 9 },
  { category: "LESUNG", keywords: [/\blesung\b/i, /\bautorlesung\b/i, /\bbuchvorstellung\b/i, /\bliteratur\b/i, /\bpoetry\b/i, /\bslam\b/i], weight: 9 },
  { category: "AUSSTELLUNG", keywords: [/\bausstellung\b/i, /\bvernissage\b/i, /\bgalerie\b/i, /\bexhibition\b/i, /\bkunst\b/i], weight: 7 },

  // Märkte & Messen
  { category: "WEIHNACHTSMARKT", keywords: [/\bweihnachtsmarkt\b/i, /\bchristk?indl/i, /\badvent\s*markt\b/i], weight: 10 },
  { category: "WOCHENMARKT", keywords: [/\bwochenmarkt\b/i, /\bbauernmarkt\b/i], weight: 10 },
  { category: "FOOD_FESTIVAL", keywords: [/\bfood[\s-]*festival\b/i, /\bstreet[\s-]*food\b/i, /\bkulinarisch.*fest/i], weight: 10 },
  { category: "FLOHMARKT", keywords: [/\bflohmarkt\b/i, /\btr[öo]delmarkt\b/i, /\bfloh[\s-]*\u0026?\s*tr[öo]del/i, /\bantikmarkt\b/i], weight: 10 },
  { category: "MESSE", keywords: [/\bmesse\b/i, /\bexpo\b/i, /\bfachmesse\b/i], weight: 8 },

  // Sport & Fitness
  { category: "YOGA", keywords: [/\byoga\b/i, /\bmeditation\b/i, /\bpilates\b/i, /\bachtsamkeit\b/i], weight: 10 },
  { category: "WANDERUNG", keywords: [/\bwanderung\b/i, /\bwandern\b/i, /\bhike\b/i, /\bwandertag\b/i], weight: 10 },
  { category: "LAUF", keywords: [/\blauf\b/i, /\bmarathon\b/i, /\bhalbmarathon\b/i, /\bcitylauf\b/i, /\bvolkslauf\b/i, /\brun\b/i], weight: 10 },
  { category: "TURNIER", keywords: [/\bturnier\b/i, /\btournament\b/i, /\bmeisterschaft\b/i, /\bpokal\b/i], weight: 10 },
  { category: "SPORT", keywords: [/\bsport\b/i, /\bfu[sß]ball\b/i, /\bhandball\b/i, /\bbasketball\b/i, /\btennis\b/i, /\bschwimm/i], weight: 6 },

  // Familie & Kinder
  { category: "KINDER_WORKSHOP", keywords: [/\bkinder[\s-]*workshop\b/i, /\bbasteln\b.*kinder/i, /\bkinder.*basteln\b/i, /\bferienprogramm\b/i], weight: 10 },
  { category: "KINDERTHEATER", keywords: [/\bkindertheater\b/i, /\bpuppentheater\b/i, /\bm[äa]rchentheater\b/i, /\bkasperle\b/i], weight: 10 },
  { category: "FAMILIENTAG", keywords: [/\bfamilientag\b/i, /\bfamilienfest\b/i, /\bf[üu]r\s*die\s*ganze\s*familie\b/i, /\bkinderfest\b/i], weight: 9 },

  // Essen & Trinken
  { category: "WEINPROBE", keywords: [/\bweinprobe\b/i, /\bweinverkostung\b/i, /\bweinfest\b/i, /\bwein[\s-]*tasting\b/i], weight: 10 },
  { category: "CRAFT_BEER", keywords: [/\bcraft[\s-]*beer\b/i, /\bbierfest\b/i, /\bbier[\s-]*tasting\b/i, /\bbrauerei/i], weight: 10 },
  { category: "KOCHKURS", keywords: [/\bkochkurs\b/i, /\bkochen\b/i, /\bcooking\s*class\b/i, /\bkoch[\s-]*workshop\b/i], weight: 10 },
  { category: "FOOD_TRUCK", keywords: [/\bfood[\s-]*truck\b/i], weight: 10 },
  { category: "KULINARISCHE_TOUR", keywords: [/\bkulinarische.*tour\b/i, /\bfood[\s-]*tour\b/i, /\bgenuss[\s-]*tour\b/i], weight: 10 },

  // Bildung & Business
  { category: "KONFERENZ", keywords: [/\bkonferenz\b/i, /\bconference\b/i, /\bkongress\b/i, /\bsummit\b/i], weight: 10 },
  { category: "NETWORKING", keywords: [/\bnetworking\b/i, /\bmeetup\b/i, /\bstammtisch\b/i, /\bnetzwerk/i], weight: 10 },
  { category: "SEMINAR", keywords: [/\bseminar\b/i, /\bfortbildung\b/i, /\bweiterbildung\b/i, /\bschulung\b/i], weight: 9 },
  { category: "VORTRAG", keywords: [/\bvortrag\b/i, /\btalk\b/i, /\bpodiumsdiskussion\b/i, /\bdiskussion\b/i, /\bpanel\b/i], weight: 9 },
  { category: "WORKSHOP", keywords: [/\bworkshop\b/i, /\bkurs\b/i, /\bseminar\b/i], weight: 6 },

  // Nachtleben
  { category: "KARAOKE", keywords: [/\bkaraoke\b/i], weight: 10 },
  { category: "CLUBNACHT", keywords: [/\bclub\s*nacht\b/i, /\bclubnight\b/i, /\bclub\b/i, /\bafterhour\b/i], weight: 8 },
  { category: "PARTY", keywords: [/\bparty\b/i, /\bfete\b/i, /\bfeier\b/i, /\bdisco\b/i], weight: 6 },

  // Saisonales & Feste
  { category: "KARNEVAL", keywords: [/\bkarneval\b/i, /\bfasching\b/i, /\bfastnacht\b/i, /\bfasnacht\b/i], weight: 10 },
  { category: "OKTOBERFEST", keywords: [/\boktoberfest\b/i, /\bvolksfest\b/i, /\bwasen\b/i, /\bkirmes\b/i], weight: 10 },
  { category: "SILVESTER", keywords: [/\bsilvester\b/i, /\bnew\s*year/i, /\bjahreswechsel\b/i], weight: 10 },
  { category: "STRASSENFEST", keywords: [/\bstra[sß]enfest\b/i], weight: 10 },
  { category: "STADTFEST", keywords: [/\bstadtfest\b/i, /\bdorffest\b/i, /\bkirchweih\b/i, /\bkerwe\b/i], weight: 10 },
];

export function categorizeEvent(
  title: string,
  description: string = "",
  defaultCategory: EventCategory = "SONSTIGES"
): EventCategory {
  const text = `${title} ${description}`.toLowerCase();

  let bestCategory: EventCategory = defaultCategory;
  let bestScore = 0;

  for (const rule of RULES) {
    let matchCount = 0;
    for (const kw of rule.keywords) {
      if (kw.test(text)) matchCount++;
    }
    if (matchCount > 0) {
      // Score = weight * matchCount (more keyword matches = higher confidence)
      const score = rule.weight * matchCount;
      // Prefer title matches over description-only matches
      let titleBonus = 0;
      for (const kw of rule.keywords) {
        if (kw.test(title.toLowerCase())) titleBonus += 3;
      }
      const totalScore = score + titleBonus;
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestCategory = rule.category;
      }
    }
  }

  return bestCategory;
}
