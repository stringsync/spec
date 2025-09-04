import * as fs from 'fs';
import { Position } from '~/files/position';

export class File {
  constructor(
    readonly path: string,
    readonly text: string,
  ) {}

  static async load(path: string): Promise<File> {
    const text = await fs.promises.readFile(path, 'utf8');
    return new File(path, text);
  }

  getExtension(): string {
    return this.path.split('.').at(-1) ?? '';
  }

  getLocation(position: Position): string {
    return `${this.path}:${position.line + 1}:${position.column + 1}`;
  }
}
