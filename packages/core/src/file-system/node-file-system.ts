import type { FileSystem } from './file-system';
import fs from 'fs/promises';

export class NodeFileSystem implements FileSystem {
  async read(path: string): Promise<string> {
    return fs.readFile(path, 'utf8');
  }

  async write(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, 'utf8');
  }
}
