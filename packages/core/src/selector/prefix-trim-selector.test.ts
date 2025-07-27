import { describe, it, expect } from 'bun:test';
import { PrefixTrimSelector } from './prefix-trim-selector';

describe('PrefixTrimSelector', () => {
  it('removes the prefix (case-insensitive by default)', async () => {
    const selector = new PrefixTrimSelector('Hello');
    const result = await selector.select('hello world');
    expect(result).toBe('world');
  });

  it('removes the prefix (case-sensitive)', async () => {
    const selector = new PrefixTrimSelector('Hello', { caseSensitive: true });
    const result = await selector.select('Hello world');
    expect(result).toBe('world');
  });

  it('does not remove prefix if case does not match and caseSensitive is true', async () => {
    const selector = new PrefixTrimSelector('Hello', { caseSensitive: true });
    const result = await selector.select('hello world');
    expect(result).toBe('hello world');
  });

  it('does not remove prefix if prefix is not present', async () => {
    const selector = new PrefixTrimSelector('Hi');
    const result = await selector.select('Hello world');
    expect(result).toBe('Hello world');
  });

  it('removes only the prefix and trims leading whitespace', async () => {
    const selector = new PrefixTrimSelector('Test');
    const result = await selector.select('Test    something');
    expect(result).toBe('something');
  });

  it('returns the original string if content is shorter than prefix', async () => {
    const selector = new PrefixTrimSelector('LongPrefix');
    const result = await selector.select('Short');
    expect(result).toBe('Short');
  });

  it('removes prefix when prefix is empty string', async () => {
    const selector = new PrefixTrimSelector('');
    const result = await selector.select('anything');
    expect(result).toBe('anything');
  });
});
