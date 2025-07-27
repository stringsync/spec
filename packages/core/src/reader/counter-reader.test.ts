import { describe, it, expect, beforeEach } from 'bun:test';
import { CounterReader } from './counter-reader';
import { StringReader } from './string-reader';

describe('CounterReader', () => {
  let stringReader: StringReader;
  let counterReader: CounterReader;

  beforeEach(() => {
    stringReader = new StringReader('test-value');
    counterReader = new CounterReader(stringReader);
  });

  it('should return the value from the underlying reader', async () => {
    const result = await counterReader.read();
    expect(result).toBe('test-value');
  });

  it('should increment count each time read is called', async () => {
    await counterReader.read();
    await counterReader.read();
    expect(counterReader.getReadCount()).toBe(2);
  });

  it('should return 0 before any reads', () => {
    expect(counterReader.getReadCount()).toBe(0);
  });

  it('should work with multiple reads and return correct count', async () => {
    await counterReader.read();
    await counterReader.read();
    await counterReader.read();
    expect(counterReader.getReadCount()).toBe(3);
  });
});
