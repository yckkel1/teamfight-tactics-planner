import type { Item } from "./item";
import { PageInfo } from "../common/pageInfo";

export class ItemsListResponse {
  constructor(
    public items: Item[],
    public pageInfo: PageInfo,
    public meta: { set: string },
  ) {}
}