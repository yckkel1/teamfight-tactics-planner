import { z } from "zod";

export const AddUnitToTeamSchema = z.object({
  unitId: z.string(),
  position: z.number().int().min(0).max(27),
  items: z.array(z.string()).max(3).default([]),
});

export const RemoveUnitFromTeamSchema = z.object({
  position: z.number().int().min(0).max(27),
});

export const SaveTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  slots: z.array(
    z.object({
      position: z.number().int().min(0).max(27),
      unitId: z.string().optional(),
      items: z.array(z.string()).max(3).default([]),
    }),
  ),
});

export type AddUnitToTeam = z.infer<typeof AddUnitToTeamSchema>;
export type RemoveUnitFromTeam = z.infer<typeof RemoveUnitFromTeamSchema>;
export type SaveTeam = z.infer<typeof SaveTeamSchema>;
