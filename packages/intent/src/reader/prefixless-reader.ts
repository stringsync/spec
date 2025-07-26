import type { Reader } from './types';

export class PrefixlessReader implements Reader {
  constructor(
    private prefix: string,
    private caseSensitive: boolean,
    private reader: Reader,
  ) {}

  async read(): Promise<string> {
    const description = await this.reader.read();
    const regex = new RegExp(`^\\s*${this.prefix}\\s+`, this.caseSensitive ? '' : 'i');
    return description.replace(regex, '');
  }
}
