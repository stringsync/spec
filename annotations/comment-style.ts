import type { File } from '~/files/file';

export class CommentStyle {
  private constructor(
    readonly start: string,
    readonly middle: string | null,
    readonly end: string,
  ) {}

  private static single(start: string) {
    return new CommentStyle(start, null, '\n');
  }

  private static block(start: string, middle: string, end: string) {
    return new CommentStyle(start, middle, end);
  }

  static DoubleSlash = CommentStyle.single('//');
  static SlashBlock = CommentStyle.block('/*', '*', '*/');
  static Hash = CommentStyle.single('#');
  static DoubleDash = CommentStyle.single('--');
  static TripleDoubleQuote = CommentStyle.block(`"""`, '', `"""`);
  static TripleSingleQuote = CommentStyle.block(`'''`, '', `'''`);

  static for(file: File): CommentStyle[] {
    switch (file.getExtension()) {
      case 'js':
      case 'ts':
        return [CommentStyle.DoubleSlash, CommentStyle.SlashBlock];
      case 'sql':
        return [CommentStyle.DoubleDash];
      case 'ex':
      case 'exs':
        return [CommentStyle.Hash, CommentStyle.TripleDoubleQuote];
      case 'py':
        return [CommentStyle.Hash, CommentStyle.TripleDoubleQuote, CommentStyle.TripleSingleQuote];
      default:
        return [];
    }
  }
}
