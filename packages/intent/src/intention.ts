import { RequirementLevel } from './types';
import type { Reader } from '@stringsync/core/src/reader/types';
import { PrefixTrimSelector } from '@stringsync/core/src/selector/prefix-trim-selector';

export class Intention implements Reader {
  constructor(
    private level: RequirementLevel,
    private reader: Reader,
  ) {}

  async read(): Promise<string> {
    const level = this.getHumanReadableLevel();
    const prefix = `it ${level}`;
    const content = await this.reader.read();
    const selector = new PrefixTrimSelector(prefix);
    const description = await selector.select(content);
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
