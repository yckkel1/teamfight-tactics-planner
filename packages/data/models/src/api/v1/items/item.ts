// packages/data/models/src/api/v1/items/item.ts
export type ItemKind = "component" | "item" | "artifact" | "radiant" | "emblem";

export type ItemStats = Record<string, number | string | boolean>;

export class Item {
  constructor(
    public slug: string,
    public name: string,
    public kind: ItemKind,
    public tags: string[],
    public stats: ItemStats,
    public text?: string,
    public components?: string[],
    public baseSlug?: string,
    public grantsTrait?: string,
    public unique?: boolean,
  ) {}
}