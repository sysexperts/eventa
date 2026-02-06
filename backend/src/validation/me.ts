import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  website: z.string().url().optional().or(z.literal("").transform(() => undefined))
});
