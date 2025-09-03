import { CommentStyle } from '~/annotations/comment-style';
import type { Annotation } from '~/annotations/types';
import { Cursor } from '~/files/cursor';
import type { File } from '~/files/file';

export function parse(tag: string, file: File): Annotation[] {
  const annotations = new Array<Annotation>();

  const cursor = new Cursor(file);
  const styles = CommentStyle.for(file);

  while (!cursor.eof()) {
    cursor.next();
  }

  return annotations;
}

// function tmp(input: { tag: string; comment: Comment; location: string }): Annotation {
//   // Parse the ID.
//   const tagEnd = input.comment.text.indexOf('(');
//   const idEnd = input.comment.text.indexOf(')');
//   if (tagEnd === -1 || idEnd === -1) {
//     throw new Error(`Invalid annotation format: ${input.comment.text}`);
//   }
//   const tag = input.comment.text.slice(0, tagEnd).trim();
//   if (tag !== input.tag) {
//     throw new Error(`Tag mismatch: expected "${input.tag}", found "${tag}"`);
//   }
//   const id = input.comment.text.slice(tagEnd + 1, idEnd).trim();

//   // Parse the body, if any.
//   let body = '';
//   const colonIndex = input.comment.text.indexOf(':', idEnd + 1);
//   if (colonIndex !== -1) {
//     body = input.comment.text.slice(colonIndex + 1).trim();
//   }

//   return new Annotation(id, body, input.location);
// }
