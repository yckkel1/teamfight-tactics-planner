import { z } from "zod";

export const ItemsQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  category: z
    .enum(["component", "item", "artifact", "radiant", "emblem", "completed"])
    .optional(),
  tag: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  sort: z.enum(["name", "kind"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ItemsQuery = z.infer<typeof ItemsQuerySchema>;