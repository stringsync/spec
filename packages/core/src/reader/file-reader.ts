import fs from 'fs/promises';
import type { Reader } from './types';

export class FileReader implements Reader {
  constructor(private filePath: string) {}

  async read(): Promise<string> {
    return fs.readFile(this.filePath, 'utf-8');
  }
}
