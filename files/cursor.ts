import { File } from '~/files/file';
import type { Line } from '~/files/line';
import { Position } from '~/files/position';

export class Cursor {
  private position = Position.zero();

  constructor(private file: File) {}

  peek(): Line | null {
    return this.file.getLine(this.position);
  }

  getPosition(): Position {
    return this.position;
  }

  incrementColumnBy(delta: number): void {
    if (delta < 0) {
      throw new Error(`delta must be positive`);
    }
    this.position = new Position({
      line: this.position.line,
      column: this.position.column + delta,
    });
  }

  incrementLine(): void {
    this.position = new Position({
      line: this.position.line + 1,
      column: 0,
    });
  }

  /**
   * Checks if the cursor is at the end of the line.
   */
  eol(): boolean {
    if (this.eof()) {
      return true;
    }

    const line = this.peek();
    if (!line) {
      return true;
    }

    return line.slice(this.position.column) === null;
  }

  /**
   * Checks if the cursor is at the end of the file.
   */
  eof(): boolean {
    return this.file.eof(this.position);
  }
}
