import type { File } from '~/files/file';

export class Style {
  private constructor(
    readonly type: 'single' | 'block',
    readonly start: string,
    readonly middle: string | null,
    readonly end: string,
  ) {}

  private static single(start: string) {
    return new Style('single', start, null, '\n');
  }

  private static block(start: string, middle: string, end: string) {
    return new Style('block', start, middle, end);
  }

  static DoubleSlash = Style.single('//');
  static SlashSingleStartBlock = Style.block('/*', '*', '*/');
  static SlashDoubleStarBlock = Style.block('/**', '*', '*/');
  static Hash = Style.single('#');
  static DoubleDash = Style.single('--');
  static TripleDoubleQuote = Style.block(`"""`, '', `"""`);
  static TripleSingleQuote = Style.block(`'''`, '', `'''`);

  static for(file: File): Style[] {
    switch (file.getExtension()) {
      case 'js':
      case 'ts':
        return [Style.DoubleSlash, Style.SlashDoubleStarBlock, Style.SlashSingleStartBlock];
      case 'sql':
        return [Style.DoubleDash];
      case 'ex':
      case 'exs':
        return [Style.Hash, Style.TripleDoubleQuote];
      case 'py':
        return [Style.Hash, Style.TripleDoubleQuote, Style.TripleSingleQuote];
      default:
        return [];
    }
  }
}
