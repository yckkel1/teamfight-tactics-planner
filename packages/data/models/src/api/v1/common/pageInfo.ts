// explicit model for consistent envelope across endpoint
export class PageInfo {
  constructor(
    public nextOffset: number | undefined,
    public hasMore: boolean,
  ) {}
}
