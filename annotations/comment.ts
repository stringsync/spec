import { CommentStyle } from '~/annotations/comment-style';
import type { Cursor } from '~/files/cursor';
import type { File } from '~/files/file';
import type { Position } from '~/files/position';

export class Comment {
  constructor(
    readonly text: string,
    readonly start: Position,
    readonly end: Position,
  ) {}

  static parse(file: File, cursor: Cursor): Comment[] {
    const styles = CommentStyle.getStyles(file);
    return parseStyles(styles);
  }
}

function parseStyles(styles: CommentStyle[]): Comment[] {
  const comments = new Array<Comment>();

  for (const style of styles) {
  }

  return comments;
}

function parseSlashSlash(cursor: Cursor): Comment[] {
  return [];
}

function parseSlashBlock(cursor: Cursor): Comment[] {
  return [];
}

function parseHash(cursor: Cursor): Comment[] {
  return [];
}
