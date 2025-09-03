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
    return `${this.path}:${position.line}:${position.column}`;
  }

  getLine(index: number): Line | null {
    return this.lines.at(index) ?? null;
  }

  getLineCount(): number {
    return this.lines.length;
  }
}
