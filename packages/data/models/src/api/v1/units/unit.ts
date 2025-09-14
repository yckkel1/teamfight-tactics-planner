export type UnitTrait = {
  name: string;
  category: "Class" | "Origin" | null;
};

export class Unit {
  constructor(
    public id: string,
    public name: string,
    public cost: number,
    public traits: UnitTrait[],
    public baseStats: Record<string, unknown>,
    public ability: Record<string, unknown> | null,
    public role?: string | null
  ) {}
}