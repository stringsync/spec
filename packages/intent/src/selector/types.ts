export interface Selector {
  select(content: string): Promise<string>;
}
