import type { Unit } from "./unit";
import { PageInfo } from "../common/pageInfo";

export class UnitsListResponse {
  constructor(
    public items: Unit[],
    public pageInfo: PageInfo,
    public meta: { set: string },
  ) {}
}
