import * as fs from 'fs';

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

  getLocation(index: number): string {
    let line = 1;
    let column = 1;
    for (let i = 0; i < index; i++) {
      if (this.text.charAt(i) === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
    return `${this.path}:${line}:${column}`;
  }
}
