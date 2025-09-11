// effects is opaque; keep type wide for forward-compat
export class Tier {
  constructor(
    public minUnits: number,
    public note: string | null = null,
    public effects: Record<string, unknown> = {},
  ) {}
}
