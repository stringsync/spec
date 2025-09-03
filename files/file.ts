import { Line } from '~/files/line';
import * as fs from 'fs';
import { Position } from '~/files/position';

export class File {
  private constructor(
    readonly path: string,
    private lines: Line[],
  ) {}

  static of(path: string, text: string): File {
    const lines = Line.parse(text);
    return new File(path, lines);
  }

  static async load(path: string): Promise<File> {
    const text = await fs.promises.readFile(path, 'utf8');
    return File.of(path, text);
  }

  getExtension(): string {
    return this.path.split('.').at(-1) ?? '';
  }

  getLocation(position: Position): string {
    return `${this.path}:${position.line + 1}:${position.column + 1}`;
  }

  getLine(position: Position): Line | null {
    return this.lines.at(position.line)?.slice(position.column) ?? null;
  }

  eof(position: Position): boolean {
    const hasLastLine = this.lines.length > 0;
    if (!hasLastLine) {
      return true;
    }

    const isPastLastLine = position.line >= this.lines.length;
    if (isPastLastLine) {
      return true;
    }

    const isOnLastLine = position.line === this.lines.length - 1;
    if (isOnLastLine) {
      const isPastEndOfLine = position.column > this.lines.at(-1)!.end.column;
      return isPastEndOfLine;
    }

    return false;
  }
}
