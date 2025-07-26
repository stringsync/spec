export enum RequirementLevel {
  Must = 'must',
  MustNot = 'mustNot',
  Should = 'should',
  ShouldNot = 'shouldNot',
  May = 'may',
}

export interface Reader {
  read(): Promise<string>;
}
