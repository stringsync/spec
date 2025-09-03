import { CommentStyle } from '~/annotations/comment-style';
import type { Annotation } from '~/annotations/types';
import { Cursor } from '~/files/cursor';
import type { File } from '~/files/file';

export function parse(tag: string, file: File): Annotation[] {
  const annotations = new Array<Annotation>();
  const styles = CommentStyle.for(file);
  const cursor = new Cursor(file);

  while (!cursor.eof()) {
    annotations.push(...getAnnotations(tag, file, cursor, styles));
    cursor.incrementLine();
  }

  return annotations;
}

function getAnnotations(
  tag: string,
  file: File,
  cursor: Cursor,
  styles: CommentStyle[],
): Annotation[] {
  const annotations = new Array<Annotation>();

  for (const style of styles) {
    const line = cursor.peek();
    if (!line) {
      break;
    }

    if (line.text.includes(style.start)) {
      const start = cursor.getPosition();
      const location = file.getLocation(start);
      const comment = getComment(style, cursor);
      const annotation = getAnnotation(tag, comment, style, location);
      if (annotation) {
        annotations.push(annotation);
      }
    }
  }

  return annotations;
}

function getComment(style: CommentStyle, cursor: Cursor): string {
  const line = cursor.peek();
  if (!line) {
    return '';
  }

  const startIndex = line.text.indexOf(style.start);
  if (startIndex === -1) {
    return '';
  }

  const endIndex = line.text.indexOf(style.end);
  if (endIndex === -1) {
    cursor.incrementLine();
  } else {
    cursor.incrementColumnBy(endIndex);
    return line.text.slice(startIndex, endIndex + style.end.length);
  }

  const texts = [line.text];

  while (!cursor.eof()) {
    const line = cursor.peek();
    if (!line) {
      break;
    }

    const endIndex = line.text.indexOf(style.end);
    if (endIndex === -1) {
      texts.push(line.text);
      cursor.incrementLine();
    } else {
      cursor.incrementColumnBy(endIndex);
      if (cursor.eol()) {
        cursor.incrementLine();
      }
      const text = line.text.slice(0, endIndex + style.end.length);
      texts.push(text);
      break;
    }
  }

  return texts.join('\n');
}

function getAnnotation(
  tag: string,
  comment: string,
  style: CommentStyle,
  location: string,
): Annotation | null {
  comment = stripCommentSymbols(comment, style).trim();

  // Parse the ID.
  const tagEnd = comment.indexOf('(');
  const idEnd = comment.indexOf(')');
  if (tagEnd === -1 || idEnd === -1) {
    return null;
  }
  const foundTag = comment.slice(0, tagEnd).trim();
  if (tag !== foundTag) {
    return null;
  }
  const id = comment.slice(tagEnd + 1, idEnd).trim();

  // Parse the body, if any.
  let body = '';
  const colonIndex = comment.indexOf(':', idEnd + 1);
  if (colonIndex !== -1) {
    body = comment.slice(colonIndex + 1).trim();
  }

  return {
    tag,
    id,
    body,
    location,
  };
}

function stripCommentSymbols(text: string, style: CommentStyle): string {
  const lines = text.split('\n');

  for (let index = 0; index < lines.length; index++) {
    if (index === 0) {
      lines[index] = lines[index].replace(style.start, '');
    }
    if (style.middle && index > 0 && index < lines.length - 1) {
      lines[index] = lines[index].replace(style.middle, '');
    }
    if (index === lines.length - 1) {
      lines[index] = lines[index].replace(style.end, '');
    }
  }

  return lines
    .filter((line) => line.length > 0)
    .map((line) => line.trim())
    .join('\n');
}
