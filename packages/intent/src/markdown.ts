import { SelectorReader } from './reader/selector-reader';
import type { Reader } from './reader/types';
import { FileReader } from './reader/file-reader';
import { MarkdownSelector } from './selector/markdown-selector';
import { StringReader } from './reader/string-reader';

export type MarkdownInput = { path: string } | { content: string };

export function markdown(input: MarkdownInput): Markdown {
  if ('path' in input) {
    return new Markdown(new FileReader(input.path));
  }

  if ('content' in input) {
    return new Markdown(new StringReader(input.content));
  }

  throw new Error('Invalid input for markdown');
}

class Markdown {
  constructor(private reader: Reader) {}

  subheading(subheading: string): Reader {
    const selector = new MarkdownSelector.builder().withinSubheading(subheading).build();
    return new SelectorReader(selector, this.reader);
  }
}
