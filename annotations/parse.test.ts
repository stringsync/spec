import { describe, it, expect } from 'bun:test';
import { parse } from '~/annotations/parse';
import { File } from '~/files/file';

describe('parse', () => {
  it('parses annotations without a body', () => {
    const file = new File(
      'test.ts',
      `
      // spec(foo.bar)
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
    expect(annotations[0].location).toBe('test.ts:1:1');
  });

  it('parses annotations with a body', () => {
    const file = new File(
      'test.ts',
      `
      // spec(foo.bar): baz`,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('baz');
    expect(annotations[0].location).toBe('test.ts:1:1');
  });

  it('parses multiple annotations in the same file', () => {
    const file = new File(
      'test.ts',
      `
      // spec(foo.one): one
      // spec(foo.two): two
      `,
    );

    const annotations = parse('spec', file);

    // expect(annotations).toHaveLength(2);

    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.one');
    expect(annotations[0].body).toBe('one');
    expect(annotations[0].location).toBe('test.ts:2:7');

    expect(annotations[1].tag).toBe('spec');
    expect(annotations[1].id).toBe('foo.two');
    expect(annotations[1].body).toBe('two');
    expect(annotations[1].location).toBe('test.ts:3:7');
  });
});
