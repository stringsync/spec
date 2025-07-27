import { describe, it, expect } from 'bun:test';
import { FakeFileSystem } from './fake-file-system';

describe('FakeFileSystem', () => {
  it('should write and read a file', async () => {
    const fs = new FakeFileSystem();
    await fs.write('/foo.txt', 'hello');
    const content = await fs.read('/foo.txt');
    expect(content).toBe('hello');
  });

  it('should overwrite existing file content', async () => {
    const fs = new FakeFileSystem();
    await fs.write('/foo.txt', 'first');
    await fs.write('/foo.txt', 'second');
    const content = await fs.read('/foo.txt');
    expect(content).toBe('second');
  });

  it('should throw an error when reading a non-existent file', async () => {
    const fs = new FakeFileSystem();
    await expect(fs.read('/does-not-exist.txt')).rejects.toThrow(
      'File not found: /does-not-exist.txt',
    );
  });

  it('should handle multiple files independently', async () => {
    const fs = new FakeFileSystem();
    await fs.write('/a.txt', 'A');
    await fs.write('/b.txt', 'B');
    const a = await fs.read('/a.txt');
    const b = await fs.read('/b.txt');
    expect(a).toBe('A');
    expect(b).toBe('B');
  });
});
