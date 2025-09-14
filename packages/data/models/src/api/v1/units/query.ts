import { z } from "zod";

export const UnitsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  cost: z.coerce.number().int().min(1).max(5).optional(),
  trait: z.string().trim().min(1).optional(),
  sort: z.enum(["name", "cost"]).default("cost"),
  order: z.enum(["asc", "desc"]).default("asc"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type UnitsQuery = z.infer<typeof UnitsQuerySchema>;