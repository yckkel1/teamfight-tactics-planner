export type RawItem = {
  id: string;
  setId: string;
  kind: "COMPONENT" | "COMPLETED" | "ARTIFACT" | "RADIANT" | "EMBLEM";
  slug: string;
  name: string;
  tags: string[]; // JSON array
  stats: Record<string, number | string | boolean>; // JSON object
  text: string | null;
  isUnique: boolean;
  // These would come from relations if needed
  components?: string[] | null;
  baseSlug?: string | null;
  grantsTrait?: string | null;
};