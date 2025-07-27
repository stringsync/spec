import type { Selector } from '../selector/types';
import type { Reader } from './types';

export class SelectorReader implements Reader {
  constructor(
    private selector: Selector,
    private reader: Reader,
  ) {}

  async read(): Promise<string> {
    const content = await this.reader.read();
    return this.selector.select(content);
  }
}
