import { MultiReader } from '@stringsync/core/src/reader/multi-reader';
import { RequirementLevel } from './types';
import type { Readable, Reader } from '@stringsync/core/src/reader/types';
import { StringReader } from '@stringsync/core/src/reader/string-reader';
import { readers } from '@stringsync/core/src/reader/readers';

export class Intent implements Reader {
  constructor(
    private level: RequirementLevel,
    private reader: Reader,
  ) {}

  async read(): Promise<string> {
    const level = this.getHumanReadableLevel();
    const prefix = `it ${level}`;
    const content = await this.reader.read();
    return `${prefix} ${content}`;
  }

  example(readable: Readable): Intent {
    const reader = new MultiReader([
      this.reader,
      new StringReader('\nFor example,\n'),
      readers.toReader(readable),
    ]);
    return new Intent(this.level, reader);
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
