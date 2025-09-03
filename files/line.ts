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
        offset: text.indexOf(line),
      });
      const end = new Position({
        line: index + 1,
        column: line.length + 1,
        offset: start.offset + line.length,
      });
      return new Line(line, start, end);
    });
  }
}
