import type { Reader } from './types';
import fs from 'fs/promises';

export class FileReader implements Reader {
  constructor(private filePath: string) {}

  async read(): Promise<string> {
    return fs.readFile(this.filePath, 'utf-8');
  }
}
