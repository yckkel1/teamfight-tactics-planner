import type { Tier } from "./tier";

export type TraitCategory = "Class" | "Origin" | null;

export class Trait {
  constructor(
    public name: string,
    public category: TraitCategory,
    public unitCount: number,
    public tiers: Tier[],
  ) {}
}
