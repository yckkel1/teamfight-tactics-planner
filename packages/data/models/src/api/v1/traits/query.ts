import { z } from 'zod';

export const TraitsQuerySchema = z.object({
    search: z.string().trim().min(1).optional(),
    sort: z.enum(['name', 'unitCount']).default('name'),
    order: z.enum(['asc', 'desc']).default('asc'),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
});

export type TraitsQuery = z.infer<typeof TraitsQuerySchema>;