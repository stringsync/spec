import type { Reader } from '@stringsync/core/src/reader/types';

export enum RequirementLevel {
  Must = 'must',
  MustNot = 'mustNot',
  Should = 'should',
  ShouldNot = 'shouldNot',
  May = 'may',
}

export type Readable = string | Reader;
