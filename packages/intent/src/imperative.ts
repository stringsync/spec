import { RequirementLevel } from './types';
import type { Reader } from './reader/types';
import { PrefixTrimSelector } from './selector/prefix-trim-selector';

export class Imperative implements Reader {
  constructor(
    private level: RequirementLevel,
    private reader: Reader,
  ) {}

  async read(): Promise<string> {
    const level = this.getHumanReadableLevel();
    const prefix = `it ${level} `;
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

export class NegatableImperative implements Reader {
  constructor(
    private level: RequirementLevel,
    private reader: Reader,
  ) {}

  not(): Imperative {
    switch (this.level) {
      case RequirementLevel.Must:
        return new Imperative(RequirementLevel.MustNot, this.reader);
      case RequirementLevel.Should:
        return new Imperative(RequirementLevel.ShouldNot, this.reader);
      default:
        throw new Error(`Negation is not applicable for: ${this.level}`);
    }
  }

  async read(): Promise<string> {
    const imperative = new Imperative(this.level, this.reader);
    return imperative.read();
  }
}
