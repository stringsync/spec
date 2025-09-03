import type { File } from '~/files/file';

export class CommentStyle {
  constructor(
    readonly start: string,
    readonly middle?: string,
    readonly end?: string,
  ) {}

  static SlashSlash = new CommentStyle('//');
  static SlashBlock = new CommentStyle('/*', '*', '*/');
  static Hash = new CommentStyle('#');
  static DoubleDash = new CommentStyle('--');
  static TripleDoubleQuote = new CommentStyle(`"""`, '', `"""`);
  static TripleSingleQuote = new CommentStyle(`'''`, '', `'''`);

  static for(file: File): CommentStyle[] {
    switch (file.getLanguage()) {
      case 'ts':
      case 'js':
        return [CommentStyle.SlashSlash, CommentStyle.SlashBlock];
      default:
        return [CommentStyle.SlashSlash, CommentStyle.SlashBlock, CommentStyle.Hash];
    }
  }

  isBlock() {
    return this.middle !== undefined && this.end !== undefined;
  }

  matches(text: string) {
    return text.trim().startsWith(this.start);
  }

  strip(text: string): string {
    // TODO: Fix this, this is wrong.
    return text
      .replace(this.start, '')
      .replace(this.end ?? '', '')
      .replace(this.middle ?? '', '');
  }
}
