import type { Trait } from "./trait";
import { PageInfo } from "../common/pageInfo";

export class TraitsListResponse {
  constructor(
    public items: Trait[],
    public pageInfo: PageInfo,
    public meta: { set: string },
  ) {}
}
