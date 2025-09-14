// packages/data/models/src/api/v1/units/query.ts
import { z } from "zod";

export const UnitsQuerySchema = z.object({
  search: z.string().optional().transform(val => val?.trim() || undefined), // Transform empty strings to undefined
  cost: z.coerce.number().int().min(1).max(5).optional(),
  trait: z.string().optional().transform(val => val?.trim() || undefined), // Transform empty strings to undefined
  sort: z.enum(["name", "cost"]).default("cost"),
  order: z.enum(["asc", "desc"]).default("asc"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type UnitsQuery = z.infer<typeof UnitsQuerySchema>;