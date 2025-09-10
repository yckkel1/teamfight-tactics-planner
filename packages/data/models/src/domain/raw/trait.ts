export type RawTraitTier = {
    id: string;
    traitId: string;
    minUnits: number;
    note: string | null;
    effects: Record<string, unknown>;
};

export type RawTraitWithCounts = {
    id: string;
    setId: string;
    name: string;
    category: 'Class' | 'Origin' | null;
    description: string | null;
    _count: { unitTraits: number };
    tiers?: RawTraitTier[];
};