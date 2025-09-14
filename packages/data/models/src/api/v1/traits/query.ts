import { z } from "zod";

export const TraitsQuerySchema = z.object({
  search: z.string().optional().transform(val => val?.trim() || undefined), // Transform empty strings to undefined
  sort: z.enum(["name", "unitCount"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});