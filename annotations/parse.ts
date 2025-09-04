import { Style } from '~/annotations/style';
import type { Annotation } from '~/annotations/types';
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

      const location = file.getLocation(startIndex);
      const annotation = parseAnnotation(tag, comment.text, location);
      if (annotation) {
        annotations.push(annotation);
      }

      index = comment.endIndex;
    }
  }

  return annotations;
}

function parseComment(index: number, file: File, style: Style): { endIndex: number; text: string } {
  let end: number;
  let text: string;
  if (style.type === 'single') {
    end = file.text.indexOf('\n', index);
    if (end === -1) {
      end = file.text.length;
    }
    text = file.text.substring(index, end);
  } else {
    const endIndex = file.text.indexOf(style.end, index);
    if (endIndex === -1) {
      end = file.text.length;
      text = file.text.substring(index);
    } else {
      end = endIndex + style.end.length;
      text = file.text.substring(index, endIndex);
    }
  }
  return { endIndex: end, text };
}

function parseAnnotation(tag: string, comment: string, location: string): Annotation | null {
  let index = 0;
  // Skip leading spaces
  while (index < comment.length && comment[index] === ' ') {
    index++;
  }

  // Expect tag
  const startTag = index;
  while (index < comment.length && comment[index] !== '(' && comment[index] !== ' ') {
    index++;
  }

  const foundTag = comment.substring(startTag, index);
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

  return { tag, id, body, location };
}
