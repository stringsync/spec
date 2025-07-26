import { RequirementLevel } from './types';
import { PrefixlessReader } from './reader/prefixless-reader';
import type { Reader } from './reader/types';

export class Imperative implements Reader {
  constructor(
    private level: RequirementLevel,
    private reader: Reader,
  ) {}

  async read(): Promise<string> {
    const level = this.getHumanReadableLevel();
    const prefix = `it ${level} `;
    const reader = new PrefixlessReader(prefix, false, this.reader);
    const description = await reader.read();
    return `${prefix} ${description}`;
  }

  private getHumanReadableLevel() {
    switch (this.level) {
      case RequirementLevel.Must:
        return 'MUST';
      case RequirementLevel.MustNot:
        return 'MUST NOT';
      case RequirementLevel.Should:
        return 'SHOULD';
      case RequirementLevel.ShouldNot:
        return 'SHOULD NOT';
      case RequirementLevel.May:
        return 'MAY';
      default:
        throw new Error('Unknown requirement level');
    }
  }
}
