export class Position {
  readonly line: number; // 0-based
  readonly column: number; // 0-based

  constructor({ line, column }: { line: number; column: number }) {
    this.line = line;
    this.column = column;
  }

  static zero(): Position {
    return new Position({ line: 0, column: 0 });
  }
}
