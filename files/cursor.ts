import { File } from '~/files/file';
import type { Line } from '~/files/line';

export class Cursor {
  private index = 0;

  constructor(private file: File) {}

  current(): Line | null {
    return this.file.getLine(this.index);
  }

  next(): Line | null {
    const line = this.file.getLine(this.index);
    if (line) {
      this.index++;
    }
    return line;
  }

  hasNext(): boolean {
    return this.index < this.file.getLineCount();
  }
}
