import { FileReader } from '@stringsync/core/src/reader/file-reader';
import { StringReader } from '@stringsync/core/src/reader/string-reader';
import type { Reader } from '@stringsync/core/src/reader/types';
import { MarkdownSelector } from '@stringsync/core/src/selector/markdown-selector';
import { SelectorReader } from '@stringsync/core/src/reader/selector-reader';
import { NodeFileSystem } from '@stringsync/core/src/file-system/node-file-system';

export type MarkdownInput = { path: string } | { content: string };

export function markdown(input: MarkdownInput): Markdown {
  if ('path' in input) {
    const fileSystem = new NodeFileSystem();
    const reader = new FileReader(fileSystem, input.path);
    return new Markdown(reader);
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
