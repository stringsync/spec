import type { Reader } from './types';

export class MultiReader implements Reader {
  constructor(private readers: Reader[]) {}

  async read(): Promise<string> {
    const results = await Promise.all(this.readers.map((reader) => reader.read()));
    return results.join('\n');
  }
}
