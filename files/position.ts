export class Position {
  readonly line: number;
  readonly column: number;
  readonly offset: number;

  constructor({ line, column, offset }: { line: number; column: number; offset: number }) {
    this.line = line;
    this.column = column;
    this.offset = offset;
  }

  move(offset: number): Position {
    return new Position({
      line: this.line,
      column: this.column + offset,
      offset: this.offset + offset,
    });
  }
}
