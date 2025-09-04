import { describe, it, expect } from 'bun:test';
import { parse } from '~/annotations/parse';
import { File } from '~/files/file';

describe('parse', () => {
  it('should extract double slash annotations without a body', () => {
    const file = File.of('test.ts', '// spec(foo.bar)');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
    expect(annotations[0].location).toBe('test.ts:1:1');
  });

  it('should extract double slash annotations with a body', () => {
    const file = File.of('test.ts', '// spec(foo.bar): Hello, world!');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Hello, world!');
    expect(annotations[0].location).toBe('test.ts:1:1');
  });

  it('should extract single line slash block annotations', () => {
    const file = File.of('test.ts', '/* spec(foo.bar): Hello, world! */');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Hello, world!');
    expect(annotations[0].location).toBe('test.ts:1:1');
  });

  it('should extract multi line slash block annotations', () => {
    const file = File.of(
      'test.ts',
      `
/** 
 * spec(foo.bar): Hello world!
 * 
 * This should be included.
 */
`,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Hello world!\n\nThis should be included.');
    expect(annotations[0].location).toBe('test.ts:2:1');
  });

  it('should ignore unrelated comments', () => {
    const file = File.of('test.ts', '// This is a random comment but it has spec to be tricky');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(0);
  });

  it('should extract multiple annotations in one file', () => {
    const file = File.of('test.ts', `// spec(foo.bar)\n// spec(baz.qux): Another body`);

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(2);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
    expect(annotations[1].id).toBe('baz.qux');
    expect(annotations[1].body).toBe('Another body');
  });

  it('should handle annotations with extra whitespace', () => {
    const file = File.of('test.ts', '//   spec(foo.bar)   :   Body with spaces   ');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Body with spaces');
  });

  it('should not extract annotation if tag does not match', () => {
    const file = File.of('test.ts', '// other(foo.bar): Should not match');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(0);
  });

  it('should extract annotation with empty body after colon', () => {
    const file = File.of('test.ts', '// spec(foo.bar):');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
  });

  it('should extract annotation from block comment with no body', () => {
    const file = File.of('test.ts', '/* spec(foo.bar) */');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
  });

  it('should ignore malformed annotation missing parentheses', () => {
    const file = File.of('test.ts', '// spec foo.bar: Should not match');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(0);
  });

  it('should extract annotation with nested parentheses in body', () => {
    const file = File.of('test.ts', '// spec(foo.bar): Body with (parentheses) inside');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].body).toBe('Body with (parentheses) inside');
  });

  it('should extract annotation from multi-line block comment with leading stars', () => {
    const file = File.of(
      'test.ts',
      `
/**
 * spec(foo.bar): Hello
 * World!
 */
`,
    );

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].body).toBe('Hello\nWorld!');
  });

  it('should extract multiple annotations on the same line', () => {
    const file = File.of('test.ts', `/* spec(foo.bar): Hello */ /* spec(baz.qux): World! */`);

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(2);
    expect(annotations[0].body).toBe('Hello');
    expect(annotations[1].body).toBe('World!');
  });
});
