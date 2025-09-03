import { describe, it, expect } from 'bun:test';
import { parse } from '~/annotations/annotations';
import { File } from '~/files/file';

describe('parse', () => {
  it('should extract // annotations without a body', () => {
    const file = File.of('test.ts', 'const a = 1; // spec(foo.bar) ');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBeEmpty();
    expect(annotations[0].location).toBe('test.ts:1:4');
  });

  it('should extract /* annotations */', () => {
    const file = File.of('test.ts', 'const a = 1; /* spec(foo.bar): Hello, world! */');

    const annotations = parse('spec', file);

    expect(annotations).toHaveLength(1);
    expect(annotations[0].tag).toBe('spec');
    expect(annotations[0].id).toBe('foo.bar');
    expect(annotations[0].body).toBe('Hello, world!');
    expect(annotations[0].location).toBe('test.ts:1:4');
  });
});
