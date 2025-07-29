import { describe, it, expect } from 'bun:test';
import { Spec } from './spec';
import { StringReader } from '@stringsync/core/src/reader/string-reader';

describe('Spec', () => {
  it('should create a Spec from string values', async () => {
    const spec = Spec.of({ foo: 'bar', baz: 'qux' });
    expect(spec).toBeInstanceOf(Spec);

    const ids = spec.getIds();
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

    expect(spec.read('greet')).resolves.toBe('hello');
  });

  it('should reject when reading a non-existent id', async () => {
    const spec = Spec.of({ foo: 'bar' });
    expect(spec.read('missing')).rejects.toThrow('No reader found for id: missing');
  });

  it('ids should return all keys', () => {
    const spec = Spec.of({ a: '1', b: '2' });
    const ids = spec.getIds();
    expect(ids).toEqual(expect.arrayContaining(['a', 'b']));
  });
});
