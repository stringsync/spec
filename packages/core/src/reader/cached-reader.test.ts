import { beforeEach, describe } from 'bun:test';
import { CounterReader } from './counter-reader';
import { StringReader } from './string-reader';
import { expect, it } from 'bun:test';
import { CachedReader } from './cached-reader';

describe('CachedReader', () => {
  let counterReader: CounterReader;

  beforeEach(() => {
    const stringReader = new StringReader('Hello, world!');
    counterReader = new CounterReader(stringReader);
  });

  it('should return the same value on multiple reads', async () => {
    const cachedReader = new CachedReader(counterReader);

    const first = await cachedReader.read();
    const second = await cachedReader.read();

    expect(first).toBe('Hello, world!');
    expect(second).toBe('Hello, world!');
  });

  it('should only call the underlying reader once', async () => {
    const cachedReader = new CachedReader(counterReader);

    await cachedReader.read();
    await cachedReader.read();
    await cachedReader.read();

    expect(counterReader.getReadCount()).toBe(1);
  });

  it('should cache the value even if read is awaited in parallel', async () => {
    const cachedReader = new CachedReader(counterReader);

    const [first, second] = await Promise.all([cachedReader.read(), cachedReader.read()]);

    expect(first).toBe('Hello, world!');
    expect(second).toBe('Hello, world!');
    expect(counterReader.getReadCount()).toBe(1);
  });
});
