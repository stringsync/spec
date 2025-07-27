import type { Selector } from './types';

export type PrefixTrimSelectorOptions = {
  caseSensitive: boolean;
};

const DEFAULT_OPTIONS: PrefixTrimSelectorOptions = {
  caseSensitive: false,
};

export class PrefixTrimSelector implements Selector {
  private options: PrefixTrimSelectorOptions;

  constructor(
    private prefix: string,
    options?: Partial<PrefixTrimSelectorOptions>,
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async select(content: string): Promise<string> {
    const prefix = content.slice(0, this.prefix.length);
    if (this.options.caseSensitive && prefix === this.prefix) {
      return content.slice(this.prefix.length).trimStart();
    } else if (prefix.toLowerCase() === this.prefix.toLowerCase()) {
      return content.slice(this.prefix.length).trimStart();
    } else {
      return content;
    }
  }
}
