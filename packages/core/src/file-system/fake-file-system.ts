import type { FileSystem } from './file-system';

export class FakeFileSystem implements FileSystem {
  private files: Map<string, string> = new Map();

  async read(path: string): Promise<string> {
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    return this.files.get(path)!;
  }

  async write(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }
}
