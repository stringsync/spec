import type { Reader } from './types';

export class PrefixlessReader implements Reader {
  constructor(
    private prefix: string,
    private reader: Reader,
    private opts = {
      caseSensitive: false,
    },
  ) {}

  async read(): Promise<string> {
    const description = await this.reader.read();
    const regex = new RegExp(`^\\s*${this.prefix}\\s+`, this.opts.caseSensitive ? '' : 'i');
    return description.replace(regex, '');
  }
}
