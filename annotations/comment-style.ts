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

  static getStyles(file: File): CommentStyle[] {
    switch (file.getExtension()) {
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

  sanitize(text: string) {
    const lines = text.split('\n');

    for (let index = 0; index < lines.length; index++) {
      if (this.isBlock()) {
        if (index === 0) {
          lines[index] = lines[index].replace(this.start, '');
        } else if (index === lines.length - 1) {
          lines[index] = lines[index].replace(this.end!, '');
        } else {
          lines[index] = lines[index].replace(this.middle!, '');
        }
      } else {
        lines[index] = lines[index].replace(this.start, '');
      }
    }

    return lines.join('\n');
  }
}
