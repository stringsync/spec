import { describe, it, expect } from 'bun:test';
import { PrefixTrimSelector } from '../selector/prefix-trim-selector';
import { StringReader } from './string-reader';
import { SelectorReader } from './selector-reader';

describe('SelectorReader', () => {
  it('adapts a selector transformation to a reader', async () => {
    const selector = new PrefixTrimSelector('Hello, ');
    const reader = new StringReader('Hello, world!');
    const selectorReader = new SelectorReader(selector, reader);

    const result = await selectorReader.read();

    expect(result).toBe('world!');
  });
});
