import type { Trait } from './trait.js';
import { PageInfo } from '../common/pageInfo.js';


export class TraitsListResponse {
constructor(
public items: Trait[],
public pageInfo: PageInfo,
public meta: { set: string },
) {}
}