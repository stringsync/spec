import { describe, it, expect } from 'bun:test';
import { FakeFileSystem } from '@stringsync/core/src/file-system/fake-file-system';
import { markdown } from './markdown';

describe('markdown', () => {
  it('creates a Markdown instance from a file path', async () => {
    const path = 'example.md';
    const fileSystem = new FakeFileSystem();
    await fileSystem.write(path, '# Example\n\n## Subheading\nContent under subheading');

    const md = markdown({ path, fileSystem });
    const result = await md.subheading('Subheading').read();

    expect(result).toBe('Content under subheading');
  });

  it('creates a Markdown instance from content', async () => {
    const content = '# Example\n\n## Subheading\nContent under subheading';

    const md = markdown({ content });
    const result = await md.subheading('Subheading').read();

    expect(result).toBe('Content under subheading');
  });
});
