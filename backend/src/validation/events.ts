import { z } from "zod";

export const eventCategorySchema = z.enum([
  "KONZERT", "FESTIVAL", "MUSICAL", "OPER", "KABARETT", "OPEN_MIC", "DJ_EVENT",
  "THEATER", "COMEDY", "TANZ", "ZAUBERSHOW",
  "AUSSTELLUNG", "LESUNG", "FILM", "FOTOGRAFIE", "MUSEUM",
  "FLOHMARKT", "WOCHENMARKT", "WEIHNACHTSMARKT", "MESSE", "FOOD_FESTIVAL",
  "SPORT", "LAUF", "TURNIER", "YOGA", "WANDERUNG",
  "KINDERTHEATER", "FAMILIENTAG", "KINDER_WORKSHOP",
  "WEINPROBE", "CRAFT_BEER", "KOCHKURS", "FOOD_TRUCK", "KULINARISCHE_TOUR",
  "WORKSHOP", "SEMINAR", "KONFERENZ", "NETWORKING", "VORTRAG",
  "CLUBNACHT", "KARAOKE", "PARTY",
  "KARNEVAL", "OKTOBERFEST", "SILVESTER", "STADTFEST", "STRASSENFEST",
  "SONSTIGES"
]);

export const createEventSchema = z.object({
  title: z.string().min(3),
  shortDescription: z.string().min(10).max(200),
  description: z.string().min(20),
  category: eventCategorySchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  address: z.string().min(3),
  city: z.string().min(2),
  country: z.string().min(2),
  imageUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  ticketUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  price: z.string().max(50).optional().or(z.literal("").transform(() => undefined)),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
  community: z.string().max(50).optional().or(z.literal("").transform(() => undefined)),
  isFeatured: z.boolean().optional().default(false),
  heroFocusY: z.number().int().min(0).max(100).optional().default(50)
});

export const updateEventSchema = createEventSchema.partial();
