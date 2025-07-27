import type { Reader } from './types';

export class CounterReader implements Reader {
  private count = 0;

  constructor(private reader: Reader) {}

  async read(): Promise<string> {
    this.count++;
    return await this.reader.read();
  }

  getReadCount(): number {
    return this.count;
  }
}
