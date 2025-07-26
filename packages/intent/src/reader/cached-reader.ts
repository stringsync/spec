import type { Reader } from './types';

export class CachedReader implements Reader {
  private cache: string | null = null;

  constructor(private reader: Reader) {}

  async read(): Promise<string> {
    this.cache ??= await this.reader.read();
    return this.cache;
  }
}
