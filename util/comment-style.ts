import type { File } from '~/util/file';

export class CommentStyle {
  private constructor(
    readonly type: 'single' | 'block',
    readonly start: string,
    readonly middle: string | null,
    readonly end: string,
  ) {}

  private static single(start: string) {
    return new CommentStyle('single', start, null, '\n');
  }

  private static block(start: string, middle: string, end: string) {
    return new CommentStyle('block', start, middle, end);
  }

  static Any = CommentStyle.single('');
  static DoubleSlash = CommentStyle.single('//');
  static SlashSingleStarBlock = CommentStyle.block('/*', '*', '*/');
  static SlashDoubleStarBlock = CommentStyle.block('/**', '*', '*/');
  static Hash = CommentStyle.single('#');
  static DoubleDash = CommentStyle.single('--');
  static TripleDoubleQuote = CommentStyle.block(`"""`, '', `"""`);
  static TripleSingleQuote = CommentStyle.block(`'''`, '', `'''`);
  static TripleSlash = CommentStyle.single('///');
  static AngleBracketBlock = CommentStyle.block('<!--', '', '-->');
  static Semicolon = CommentStyle.single(';');
  static LuaBlock = CommentStyle.block('--[[', '', ']]');

  static for(file: File): CommentStyle[] {
    switch (file.getExtension()) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return [
          CommentStyle.DoubleSlash,
          CommentStyle.SlashDoubleStarBlock,
          CommentStyle.SlashSingleStarBlock,
        ];
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
        return [
          CommentStyle.DoubleSlash,
          CommentStyle.SlashDoubleStarBlock,
          CommentStyle.SlashSingleStarBlock,
        ];
      case 'php':
        return [
          CommentStyle.DoubleSlash,
          CommentStyle.SlashDoubleStarBlock,
          CommentStyle.SlashSingleStarBlock,
          CommentStyle.Hash,
        ];
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return [CommentStyle.SlashDoubleStarBlock, CommentStyle.SlashSingleStarBlock];
      case 'sql':
        return [CommentStyle.DoubleDash];
      case 'lua':
        return [CommentStyle.DoubleDash, CommentStyle.LuaBlock];
      case 'ex':
      case 'exs':
        return [CommentStyle.Hash, CommentStyle.TripleDoubleQuote];
      case 'py':
        return [CommentStyle.Hash, CommentStyle.TripleDoubleQuote, CommentStyle.TripleSingleQuote];
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
        return [CommentStyle.Hash];
      case 'cs':
        return [
          CommentStyle.DoubleSlash,
          CommentStyle.SlashDoubleStarBlock,
          CommentStyle.SlashSingleStarBlock,
          CommentStyle.TripleSlash,
        ];
      case 'xml':
      case 'html':
      case 'vue':
      case 'svelte':
      case 'md':
      case 'markdown':
        return [CommentStyle.AngleBracketBlock];
      case 'ini':
      case 'cfg':
        return [CommentStyle.Semicolon, CommentStyle.Hash];
      default:
        return [CommentStyle.Any];
    }
  }
}
