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
    expect(annotations[0].location).toBe('test.ts:2:10');
  });

  it('parses annotations with a body', () => {
    const file = new File(
      'test.ts',
      `
      // spec(foo.bar): baz
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('baz');
    expect(annotations[0].location).toBe('test.ts:2:10');
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

    expect(annotations).toHaveLength(2);

    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.one');
    expect(annotations[0].body).toBe('one');
    expect(annotations[0].location).toBe('test.ts:2:10');

    expect(annotations[1].tag).toBe('spec');
    expect(annotations[1].id).toBe('foo.two');
    expect(annotations[1].body).toBe('two');
    expect(annotations[1].location).toBe('test.ts:3:10');
  });

  it('ignores non-annotation comments', () => {
    const file = new File(
      'test.ts',
      `
      // not an annotation
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toBeEmpty();
  });

  it('ignores annotation text that is not inside comments', () => {
    const file = new File(
      'test.ts',
      `
      spec(foo.bar)
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toBeEmpty();
  });

  it('parses annotations after non-annotations', () => {
    const file = new File(
      'test.ts',
      `
      // not an annotation
      // spec(foo.bar)
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
    expect(annotations[0].location).toBe('test.ts:3:10');
  });

  it('parses block comment annotations', () => {
    const file = new File(
      'test.ts',
      `
      /**
       * spec(foo.bar): baz
       */
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('baz');
    expect(annotations[0].location).toBe('test.ts:3:10');
  });

  it('parses block comment and single line comment annotations in the same file', () => {
    const file = new File(
      'test.ts',
      `
      /**
       * spec(foo.bar): baz
       */
      // spec(foo.qux): qux
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(2);

    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('baz');
    expect(annotations[0].location).toBe('test.ts:3:10');

    expect(annotations[1].tag).toBe('spec');
    expect(annotations[1].id).toBe('foo.qux');
    expect(annotations[1].body).toBe('qux');
    expect(annotations[1].location).toBe('test.ts:5:10');
  });

  it('ignores annotations with invalid tags', () => {
    const file = new File(
      'test.ts',
      `
      // specification(foo.bar)
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toBeEmpty();
  });

  it('parses specs in the middle a of comment', () => {
    const file = new File(
      'test.ts',
      `
      // This is a spec(foo.bar) comment.
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
    expect(annotations[0].location).toBe('test.ts:2:15');
  });

  it('parses annotations with a multi line body', () => {
    const file = new File(
      'test.ts',
      `
      // not this line
      //
      // spec(foo.bar): one
      // two
      // three
      //
      // not this line
      `,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe(`line one\ntwo\nthree`);
    expect(annotations[0].location).toBe('test.ts:2:10');
  });
});
