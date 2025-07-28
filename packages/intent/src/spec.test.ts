import { describe, it, expect } from 'bun:test';
import { Spec } from './spec';
import { StringReader } from '@stringsync/core/src/reader/string-reader';

describe('Spec', () => {
  it('should create a Spec from string values', async () => {
    const spec = Spec.of({ foo: 'bar', baz: 'qux' });
    expect(spec).toBeInstanceOf(Spec);

    const ids = spec.ids();
    expect(ids).toContain('foo');
    expect(ids).toContain('baz');

    const fooValue = await spec.read('foo');
    expect(fooValue).toBe('bar');

    const bazValue = await spec.read('baz');
    expect(bazValue).toBe('qux');
  });

  it('should create a Spec from Reader values', async () => {
    const reader = new StringReader('hello');
    const spec = Spec.of({ greet: reader });

    expect(await spec.read('greet')).toBe('hello');
  });

  it('should reject when reading a non-existent id', async () => {
    const spec = Spec.of({ foo: 'bar' });
    await expect(spec.read('missing')).rejects.toThrow('No reader found for id: missing');
  });

  it('impl and ref should be callable', () => {
    const spec = Spec.of({ foo: 'bar' });
    expect(typeof spec.impl('foo')).toBe('function');
    expect(typeof spec.ref('foo')).toBe('function');
  });

  it('ids should return all keys', () => {
    const spec = Spec.of({ a: '1', b: '2' });
    const ids = spec.ids();
    expect(ids).toEqual(expect.arrayContaining(['a', 'b']));
  });
});
