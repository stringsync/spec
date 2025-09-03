import type { Cursor } from '~/files/cursor';
import type { Position } from '~/files/position';

export class Comment {
  constructor(
    readonly text: string,
    readonly start: Position,
    readonly end: Position,
  ) {}

  static parse(cursor: Cursor): Comment[] {
    const comments = new Array<Comment>();

    return comments;
  }
}
