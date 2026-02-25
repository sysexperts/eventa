import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  website: z.string().url().optional().or(z.literal("").transform(() => undefined))
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
