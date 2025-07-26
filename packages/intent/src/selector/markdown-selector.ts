import type { Selector } from './types';

export class MarkdownSelector implements Selector {
  private constructor(private selectors: Selector[]) {}

  static Builder = class MarkdownSelectorBuilder {
    private selectors = new Array<Selector>();

    withinSubheading(subheading: string): this {
      this.selectors.push(new SubheadingSectionSelector(subheading));
      return this;
    }

    build(): MarkdownSelector {
      if (this.selectors.length === 0) {
        throw new Error('At least one selector must be provided');
      }
      return new MarkdownSelector(this.selectors);
    }
  };

  async select(content: string): Promise<string> {
    let result = content;
    for (const selector of this.selectors) {
      result = await selector.select(result);
    }
    return Promise.resolve(result);
  }
}

class SubheadingSectionSelector implements Selector {
  constructor(private subheading: string) {}

  async select(content: string): Promise<string> {
    const subheading = `## ${this.subheading}`;

    const startIndex = content.indexOf(subheading);
    if (startIndex === -1) {
      throw new Error(`Subheading "${subheading}" not found`);
    }

    let endIndex = content.indexOf('## ', startIndex + subheading.length);
    if (endIndex === -1) {
      endIndex = content.length;
    }

    return content.substring(startIndex + subheading.length, endIndex).trim();
  }
}
