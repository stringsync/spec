import type { File } from '~/util/file';

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

  static Any = Style.single('');
  static DoubleSlash = Style.single('//');
  static SlashSingleStarBlock = Style.block('/*', '*', '*/');
  static SlashDoubleStarBlock = Style.block('/**', '*', '*/');
  static Hash = Style.single('#');
  static DoubleDash = Style.single('--');
  static TripleDoubleQuote = Style.block(`"""`, '', `"""`);
  static TripleSingleQuote = Style.block(`'''`, '', `'''`);
  static TripleSlash = Style.single('///');
  static AngleBracketBlock = Style.block('<!--', '', '-->');
  static Semicolon = Style.single(';');
  static LuaBlock = Style.block('--[[', '', ']]');

  static for(file: File): Style[] {
    switch (file.getExtension()) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return [Style.DoubleSlash, Style.SlashDoubleStarBlock, Style.SlashSingleStarBlock];
      case 'java':
      case 'c':
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'h':
      case 'hpp':
      case 'go':
      case 'rs':
      case 'swift':
      case 'kt':
      case 'scala':
      case 'dart':
        return [Style.DoubleSlash, Style.SlashDoubleStarBlock, Style.SlashSingleStarBlock];
      case 'php':
        return [
          Style.DoubleSlash,
          Style.SlashDoubleStarBlock,
          Style.SlashSingleStarBlock,
          Style.Hash,
        ];
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return [Style.SlashDoubleStarBlock, Style.SlashSingleStarBlock];
      case 'sql':
        return [Style.DoubleDash];
      case 'lua':
        return [Style.DoubleDash, Style.LuaBlock];
      case 'ex':
      case 'exs':
        return [Style.Hash, Style.TripleDoubleQuote];
      case 'py':
        return [Style.Hash, Style.TripleDoubleQuote, Style.TripleSingleQuote];
      case 'rb':
      case 'sh':
      case 'bash':
      case 'zsh':
      case 'fish':
      case 'yaml':
      case 'yml':
      case 'toml':
      case 'r':
      case 'pl':
      case 'pm':
        return [Style.Hash];
      case 'cs':
        return [
          Style.DoubleSlash,
          Style.SlashDoubleStarBlock,
          Style.SlashSingleStarBlock,
          Style.TripleSlash,
        ];
      case 'xml':
      case 'html':
      case 'vue':
      case 'svelte':
      case 'md':
      case 'markdown':
        return [Style.AngleBracketBlock];
      case 'ini':
      case 'cfg':
        return [Style.Semicolon, Style.Hash];
      default:
        return [Style.Any];
    }
  }
}
