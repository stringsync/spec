import { Position } from '~/files/position';

export class Line {
  constructor(
    readonly text: string,
    readonly start: Position,
    readonly end: Position,
  ) {}

  static parse(text: string): Line[] {
    return text.split('\n').map((line, index) => {
      const start = new Position({
        line: index + 1,
        column: 1,
      });
      const end = new Position({
        line: index + 1,
        column: line.length + 1,
      });
      return new Line(`${line}\n`, start, end);
    });
  }

  slice(column: number): Line | null {
    if (column > this.end.column) {
      return null;
    }
    const start = new Position({
      line: this.start.line,
      column: column,
    });
    const text = this.text.slice(column);
    return new Line(text, start, this.end);
  }
}
