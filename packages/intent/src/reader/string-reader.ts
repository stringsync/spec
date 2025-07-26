import type { Reader } from './types';

export class StringReader implements Reader {
  constructor(private str: string) {}

  async read(): Promise<string> {
    return this.str;
  }
}
