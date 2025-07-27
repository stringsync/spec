import { describe, it, expect, beforeEach } from 'bun:test';
import { FakeFileSystem } from '../file-system/fake-file-system';
import { FileReader } from './file-reader';

describe('FileReader', () => {
  let fakeFileSystem: FakeFileSystem;

  beforeEach(() => {
    fakeFileSystem = new FakeFileSystem();
  });

  it('reads file content using the file system', async () => {
    const filePath = '/test/file.txt';
    const fileContent = 'Hello, world!';
    fakeFileSystem.write(filePath, fileContent);

    const reader = new FileReader(fakeFileSystem, filePath);
    const content = await reader.read();

    expect(content).toBe(fileContent);
  });

  it('throws or rejects if file does not exist', async () => {
    const fakeFs = new FakeFileSystem();
    const filePath = '/not/exist.txt';
    const reader = new FileReader(fakeFs, filePath);

    await expect(reader.read()).rejects.toBeDefined();
  });

  it('reads empty file content', async () => {
    const fakeFs = new FakeFileSystem();
    const filePath = '/empty.txt';
    fakeFs.write(filePath, '');

    const reader = new FileReader(fakeFs, filePath);
    const content = await reader.read();

    expect(content).toBe('');
  });
});
