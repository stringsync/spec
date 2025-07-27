import type { Reader } from './types';
import type { FileSystem } from '../file-system/types';

export class FileReader implements Reader {
  constructor(
    private fileSystem: FileSystem,
    private filePath: string,
  ) {}

  async read(): Promise<string> {
    return this.fileSystem.read(this.filePath);
  }
}
