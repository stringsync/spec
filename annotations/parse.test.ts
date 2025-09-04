import { describe, it, expect } from 'bun:test';
import { parse } from '~/annotations/parse';
import { File } from '~/files/file';

describe('parse', () => {
  it('parses double slash annotations without a body', () => {
    const file = new File('test.ts', '// spec(foo.bar)');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
    expect(annotations[0].location).toBe('test.ts:1:1');
  });

  it('parses double slash annotations with a body', () => {
    const file = new File('test.ts', '// spec(foo.bar): Hello, world!');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Hello, world!');
    expect(annotations[0].location).toBe('test.ts:1:1');
  });

  it('parses single line slash block annotations', () => {
    const file = new File('test.ts', '/* spec(foo.bar): Hello, world! */');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Hello, world!');
    expect(annotations[0].location).toBe('test.ts:1:1');
  });

  it('parses multi line slash block annotations', () => {
    const file = new File(
      'test.ts',
      `
/** 
 * spec(foo.bar): Hello world!
 */
`,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Hello world!');
    expect(annotations[0].location).toBe('test.ts:2:1');
  });

  it('ignores unrelated comments', () => {
    const file = new File('test.ts', '// This is a random comment but it has spec to be tricky');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(0);
  });

  it('parses multiple annotations in one file', () => {
    const file = new File('test.ts', `// spec(foo.bar)\n// spec(baz.qux): Another body`);

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(2);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
    expect(annotations[1].id).toBe('baz.qux');
    expect(annotations[1].body).toBe('Another body');
  });

  it('should handle annotations with extra whitespace', () => {
    const file = new File('test.ts', '//   spec(foo.bar)   :   Body with spaces   ');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Body with spaces');
  });

  it('should not extract annotation if tag does not match', () => {
    const file = new File('test.ts', '// other(foo.bar): Should not match');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(0);
  });

  it('parses annotation with empty body after colon', () => {
    const file = new File('test.ts', '// spec(foo.bar):');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
  });

  it('parses annotation from block comment with no body', () => {
    const file = new File('test.ts', '/* spec(foo.bar) */');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
  });

  it('ignores malformed annotation missing parentheses', () => {
    const file = new File('test.ts', '// spec foo.bar: Should not match');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(0);
  });

  it('parses annotation with nested parentheses in body', () => {
    const file = new File('test.ts', '// spec(foo.bar): Body with (parentheses) inside');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].body).toBe('Body with (parentheses) inside');
  });

  it('parses annotation from multi-line block comment with leading stars', () => {
    const file = new File(
      'test.ts',
      `
/**
 * spec(foo.bar): Hello
 * World!
 * 
 * Not this line.
 */
`,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].body).toBe('Hello\nWorld!');
  });

  it('parses multiple annotations on the same line', () => {
    const file = new File('test.ts', `/* spec(foo.bar): Hello */ /* spec(baz.qux): World! */`);

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(2);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Hello');
    expect(annotations[1].id).toBe('baz.qux');
    expect(annotations[1].body).toBe('World!');
  });

  it('parses a single line style annotation body', () => {
    const file = new File(
      'test.ts',
      `
      // spec(foo.bar): Hello
      // World!`,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].body).toBe('Hello\nWorld!');
  });
});
