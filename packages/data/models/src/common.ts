import { z } from 'zod';

/** API envelope bits */
export const PageInfoOffsetSchema = z.object({
nextOffset: z.number().optional(),
hasMore: z.boolean(),
});
export type PageInfoOffset = z.infer<typeof PageInfoOffsetSchema>;

export const ErrorEnvelopeSchema = z.object({
error: z.object({ code: z.string(), message: z.string(), details: z.record(z.string(), z.any()).optional() }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

/** Current set meta */
export const CURRENT_SET_META = { set: 'set15', setName: 'K.O. Coliseum' } as const;