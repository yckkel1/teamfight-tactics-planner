// file: src/models/traits.ts
import { z } from 'zod';
import { PageInfoOffsetSchema } from './common.js';


/** Query schema for GET /traits */
export const IncludeTiersEnum = z.enum(['none', 'breakpoints', 'full']);
export type IncludeTiers = z.infer<typeof IncludeTiersEnum>;


export const TraitsQuerySchema = z.object({
includeTiers: IncludeTiersEnum.default('breakpoints'),
search: z.string().trim().min(1).optional(),
sort: z.enum(['name', 'unitCount']).default('name'),
order: z.enum(['asc', 'desc']).default('asc'),
limit: z.coerce.number().int().min(1).max(100).default(50),
offset: z.coerce.number().int().min(0).default(0),
});
export type TraitsQuery = z.infer<typeof TraitsQuerySchema>;


/** DTOs */
export const TraitBreakpointTierDTOSchema = z.object({ minUnits: z.number() });
export type TraitBreakpointTierDTO = z.infer<typeof TraitBreakpointTierDTOSchema>;


export const TraitFullTierDTOSchema = z.object({
minUnits: z.number(),
note: z.string().nullable().optional(),
effects: z.record(z.string(), z.any()).default({}),
});
export type TraitFullTierDTO = z.infer<typeof TraitFullTierDTOSchema>;


export const TraitDTOBaseSchema = z.object({
name: z.string(),
category: z.union([z.literal('Class'), z.literal('Origin'), z.null()]),
unitCount: z.number(),
});
export type TraitDTOBase = z.infer<typeof TraitDTOBaseSchema>;


export const TraitBreakpointsDTOSchema = TraitDTOBaseSchema.extend({
tiers: z.array(TraitBreakpointTierDTOSchema).optional(),
});
export type TraitBreakpointsDTO = z.infer<typeof TraitBreakpointsDTOSchema>;


export const TraitFullDTOSchema = TraitDTOBaseSchema.extend({
tiers: z.array(TraitFullTierDTOSchema).optional(),
});
export type TraitFullDTO = z.infer<typeof TraitFullDTOSchema>;


export const TraitsListResponseSchema = z.object({
items: z.array(z.union([TraitBreakpointsDTOSchema, TraitFullDTOSchema, TraitDTOBaseSchema])),
pageInfo: PageInfoOffsetSchema,
meta: z.object({ set: z.string() }),
});
export type TraitsListResponse = z.infer<typeof TraitsListResponseSchema>;