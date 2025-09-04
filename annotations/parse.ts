import { Style } from '~/annotations/style';
import type { Annotation, Comment } from '~/annotations/types';
import type { File } from '~/files/file';

/**
 * Parse all annotations with the given tag from the file.
 */
export function parse(tag: string, file: File): Annotation[] {
  const styles = Style.for(file);
  if (styles.length === 0) {
    return [];
  }

  const annotations: Annotation[] = [];

  for (const style of styles) {
    let index = 0;
    while (index < file.text.length) {
      const startIndex = file.text.indexOf(style.start, index);
      if (startIndex === -1) {
        break;
      }
      index = startIndex + style.start.length;

      const comment = parseComment(index, file, style);
      const commentStartIndex = startIndex + style.start.length;

      const annotation = parseAnnotation(tag, comment.text, commentStartIndex, file, style);
      if (annotation) {
        annotations.push(annotation);
      }

      index = comment.endIndex;
    }
  }

  return annotations.sort((a, b) => a.startIndex - b.startIndex);
}

function parseComment(startIndex: number, file: File, style: Style): Comment {
  let endIndex: number;
  let text: string;
  if (style.type === 'single') {
    endIndex = file.text.indexOf('\n', startIndex);
    if (endIndex === -1) {
      endIndex = file.text.length;
    }
    text = file.text.substring(startIndex, endIndex);
  } else {
    const commentEndIndex = file.text.indexOf(style.end, startIndex);
    if (commentEndIndex === -1) {
      endIndex = file.text.length;
      text = file.text.substring(startIndex);
    } else {
      endIndex = commentEndIndex + style.end.length;
      text = file.text.substring(startIndex, commentEndIndex);
    }
  }
  return { startIndex, endIndex, text };
}

function parseAnnotation(
  tag: string,
  comment: string,
  startIndex: number,
  file: File,
  style: Style,
): Annotation | null {
  let index = 0;
  // Skip leading whitespace
  while (index < comment.length && /\s/.test(comment[index])) {
    index++;
  }

  // Skip middle if present
  if (index < comment.length && comment[index] === style.middle) {
    index++;
    // Skip spaces after middle
    while (index < comment.length && comment[index] === ' ') {
      index++;
    }
  }

  // Expect tag
  const tagStartIndex = index;
  while (index < comment.length && comment[index] !== '(' && comment[index] !== ' ') {
    index++;
  }

  const foundTag = comment.substring(tagStartIndex, index);
  if (foundTag !== tag) {
    return null;
  }

  // Expect open parenthesis
  if (index >= comment.length || comment[index] !== '(') {
    return null;
  }
  index++;

  // ID until closing parenthesis
  const idStartIndex = index;
  while (index < comment.length && comment[index] !== ')') {
    index++;
  }

  if (index >= comment.length) {
    return null;
  }
  const id = comment.substring(idStartIndex, index);
  index++; // Skip closing parenthesis

  // Body is optional
  let body = '';
  if (index < comment.length && comment[index] === ':') {
    index++;

    // Skip spaces after colon
    while (index < comment.length && comment[index] === ' ') {
      index++;
    }
    body = comment.substring(index).trimEnd();
  }

  const endIndex = startIndex + index;

  const location = file.getLocation(startIndex + tagStartIndex);
  return { tag, id, body, location, startIndex, endIndex };
}
