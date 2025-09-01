import { describe, it, expect } from 'bun:test';
import { StringReader } from './string-reader';
import { MultiReader } from './multi-reader';

describe('MultiReader', () => {
  it('should read from all readers and join the results', async () => {
    const reader1 = new StringReader('Hello');
    const reader2 = new StringReader('World');
    const multiReader = new MultiReader([reader1, reader2]);

    const result = await multiReader.read();

    expect(result).toBe('HelloWorld');
  });
});
