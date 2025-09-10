import type { Tier } from './tier.js';

export type TraitCategory = 'Class' | 'Origin' | null;

export class Trait {
    constructor(
        public name: string,
        public category: TraitCategory,
        public unitCount: number,
        public tiers: Tier[],
    ) {}
}