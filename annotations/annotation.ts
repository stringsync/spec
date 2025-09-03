import type { Comment } from '~/annotations/comment';

/**
 * Represents an annotation in a file.
 *
 * For example, in the comment `// spec(calculator.add): Hello, world!`:
 *  - tag:  "spec"
 *  - id:   "calculator.add"
 *  - body: "Hello, world!"
 */
export class Annotation {
  constructor(
    readonly id: string,
    readonly body: string,
    readonly location: string,
  ) {}

  static parse(input: { tag: string; comment: Comment; location: string }): Annotation {
    // Parse the ID.
    const tagEnd = input.comment.text.indexOf('(');
    const idEnd = input.comment.text.indexOf(')');
    if (tagEnd === -1 || idEnd === -1) {
      throw new Error(`Invalid annotation format: ${input.comment.text}`);
    }
    const tag = input.comment.text.slice(0, tagEnd).trim();
    if (tag !== input.tag) {
      throw new Error(`Tag mismatch: expected "${input.tag}", found "${tag}"`);
    }
    const id = input.comment.text.slice(tagEnd + 1, idEnd).trim();

    // Parse the body, if any.
    let body = '';
    const colonIndex = input.comment.text.indexOf(':', idEnd + 1);
    if (colonIndex !== -1) {
      body = input.comment.text.slice(colonIndex + 1).trim();
    }

    return new Annotation(id, body, input.location);
  }
}
