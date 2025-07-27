import { FileReader } from '@stringsync/core/reader/file-reader';
import { StringReader } from '@stringsync/core/reader/string-reader';
import type { Reader } from '@stringsync/core/reader/types';
import { MarkdownSelector } from '@stringsync/core/selector/markdown-selector';
import { SelectorReader } from '@stringsync/core/reader/selector-reader';

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
    const selector = new MarkdownSelector.Builder().subheading(subheading).build();
    return new SelectorReader(selector, this.reader);
  }
}
