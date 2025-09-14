import type { Unit } from "../units/unit";

export type TeamSlot = {
  position: number; // 0-27 (hex grid positions)
  unit: Unit | null;
  items?: string[]; // item IDs
};

export type TeamComposition = {
  id?: string;
  name: string;
  description?: string;
  slots: TeamSlot[];
  traitSummary: TraitActivation[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type TraitActivation = {
  traitName: string;
  unitCount: number;
  tierActive: number | null; // which tier is currently active
  tierBreakpoints: number[]; // available breakpoints
};
