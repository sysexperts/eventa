import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  website: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  address: z.string().max(200).optional().or(z.literal("").transform(() => undefined)),
  zip: z.string().max(20).optional().or(z.literal("").transform(() => undefined)),
  city: z.string().max(100).optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().max(30).optional().or(z.literal("").transform(() => undefined)),
  companyName: z.string().max(200).optional().or(z.literal("").transform(() => undefined)),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
