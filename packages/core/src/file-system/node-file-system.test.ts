import { describe, it, expect, afterEach } from 'bun:test';
import fs from 'fs/promises';
import { NodeFileSystem } from './node-file-system';

describe('NodeFileSystem', () => {
  const testFile = './test-file.txt';
  const fileSystem = new NodeFileSystem();

  afterEach(async () => {
    try {
      await fs.unlink(testFile);
    } catch {
      // noop
    }
  });

  it('should write content to a file', async () => {
    await fileSystem.write(testFile, 'hello world');
    const content = await fs.readFile(testFile, 'utf8');
    expect(content).toBe('hello world');
  });

  it('should read content from a file', async () => {
    await fs.writeFile(testFile, 'test read', 'utf8');
    const content = await fileSystem.read(testFile);
    expect(content).toBe('test read');
  });

  it('should throw an error when reading a non-existent file', async () => {
    expect(fileSystem.read('non-existent.txt')).rejects.toThrow();
  });
});
