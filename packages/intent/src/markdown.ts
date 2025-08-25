import {
  FileReader,
  StringReader,
  MarkdownSelector,
  SelectorReader,
  NodeFileSystem,
  type FileSystem,
  type Reader,
} from '@stringsync/core';

export type MarkdownInput =
  | {
      path: string;
      fileSystem?: FileSystem;
    }
  | { content: string };

export class Markdown {
  private constructor(private reader: Reader) {}

  static create(input: MarkdownInput): Markdown {
    if ('path' in input) {
      const fileSystem = input.fileSystem ?? new NodeFileSystem();
      const reader = new FileReader(fileSystem, input.path);
      return new Markdown(reader);
    }

    if ('content' in input) {
      return new Markdown(new StringReader(input.content));
    }

    throw new Error('Invalid input for markdown');
  }

  subheading(subheading: string): Reader {
    const selector = new MarkdownSelector.Builder().subheading(subheading).build();
    return new SelectorReader(selector, this.reader);
  }
}
