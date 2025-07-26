import type { Reader, RequirementLevel } from './types';

export type ImperativeInput = { description: string } | { reader: Reader };

export class Imperative {
  constructor(
    private level: RequirementLevel,
    private input: ImperativeInput,
  ) {}
}
