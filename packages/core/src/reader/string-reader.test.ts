import { describe, it, expect } from 'bun:test';
import { StringReader } from './string-reader';

describe('StringReader', () => {
  it('reads a string', async () => {
    const reader = new StringReader('Hello, world!');
    const result = await reader.read();
    expect(result).toBe('Hello, world!');
  });
});
