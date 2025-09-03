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
});
