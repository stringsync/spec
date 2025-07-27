import type { Reader } from './types';

export class CachedReader implements Reader {
  private cache: string | null = null;
  private lock: Promise<void> | null = null;

  constructor(private reader: Reader) {}

  async read(): Promise<string> {
    if (this.cache !== null) {
      return this.cache;
    }

    if (!this.lock) {
      this.lock = (async () => {
        this.cache = await this.reader.read();
      })();
    }

    await this.lock;
    return this.cache!;
  }
}
