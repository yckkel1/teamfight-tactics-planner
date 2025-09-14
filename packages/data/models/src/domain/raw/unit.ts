export type RawUnitTrait = {
  trait: {
    name: string;
    category: "Class" | "Origin" | null;
  };
};

export type RawUnitWithTraits = {
  id: string;
  setId: string;
  name: string;
  cost: number;
  role: string | null;
  baseStats: Record<string, unknown>;
  ability: Record<string, unknown> | null;
  traits?: RawUnitTrait[];
};
