import { describe, it, expect } from 'bun:test';
import { Comment } from '~/annotations/comment';
import { Cursor } from '~/files/cursor';
import { File } from '~/files/file';

describe('Comment', () => {
  it('should parse single line comments', () => {
    const file = File.of('test.ts', 'const a = 1; // single line comment');
    const cursor = new Cursor(file);

    const comments = Comment.parse(file, cursor);

    expect(cursor.hasNext()).toBeFalse();
    expect(comments).toHaveLength(1);
    expect(comments[0].text).toBe('single line comment');
  });
});
