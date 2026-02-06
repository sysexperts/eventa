import { z } from "zod";

export const eventCategorySchema = z.enum([
  "KONZERT",
  "THEATER",
  "LESUNG",
  "COMEDY",
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
  isFeatured: z.boolean().optional().default(false)
});

export const updateEventSchema = createEventSchema.partial();
