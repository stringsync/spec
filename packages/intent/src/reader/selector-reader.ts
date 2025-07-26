import type { Selector } from '../selector/types';
import type { Reader } from './types';

export class SelectorReader implements Reader {
  constructor(
    private selector: Selector,
    private content: string,
  ) {}

  read(): Promise<string> {
    return this.selector.select(this.content);
  }
}
