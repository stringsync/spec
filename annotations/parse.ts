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

  // Track processed positions to avoid duplicate annotations
  const processedPositions = new Set<number>();

  for (const style of styles) {
    let index = 0;
    while (index < file.text.length) {
      const startIndex = file.text.indexOf(style.start, index);
      if (startIndex === -1) {
        break;
      }

      // Skip if we've already processed this position
      if (processedPositions.has(startIndex)) {
        index = startIndex + style.start.length;
        continue;
      }

      index = startIndex + style.start.length;

      const comment = parseComment(index, file, style);
      const commentStartIndex = startIndex + style.start.length;

      const annotation = parseAnnotation(tag, comment.text, commentStartIndex, file, style);
      if (annotation) {
        // Mark this position as processed
        processedPositions.add(startIndex);

        // Handle multi-line body for both single-line and block comments
        if (annotation.body !== '') {
          if (style.type === 'single') {
            // Handle multi-line body for single-line comments
            const bodyLines = [annotation.body];
            let nextIndex = comment.endIndex;

            // Continue reading subsequent comment lines
            while (nextIndex < file.text.length) {
              // Skip to next line
              const nextLineStart = file.text.indexOf('\n', nextIndex);
              if (nextLineStart === -1) break;
              nextIndex = nextLineStart + 1;

              // Check if next line has a comment
              const nextCommentStart = file.text.indexOf(style.start, nextIndex);
              if (nextCommentStart === -1) break;

              // Make sure the comment is at the start of the line (allowing whitespace)
              const lineContent = file.text.substring(nextIndex, nextCommentStart);
              if (lineContent.trim() !== '') break;

              // Get the comment content
              const nextCommentIndex = nextCommentStart + style.start.length;
              const nextComment = parseComment(nextCommentIndex, file, style);
              const nextCommentText = nextComment.text.trim();

              // Empty comment line ends the multi-line body
              if (nextCommentText === '') break;

              // Check if this line contains another annotation - if so, stop multi-line body
              const hasAnnotation = parseAnnotationInLine(tag, nextCommentText, 0, file);
              if (hasAnnotation) break;

              bodyLines.push(nextCommentText);
              nextIndex = nextComment.endIndex;
            }

            // Join body lines if we found additional lines
            if (bodyLines.length > 1) {
              annotation.body = bodyLines.join('\n');
            }
          } else {
            // Handle multi-line body for block comments
            const bodyLines = [annotation.body];
            const commentLines = comment.text.split('\n');

            // Find which line contains the annotation
            let annotationLineIndex = -1;
            for (let i = 0; i < commentLines.length; i++) {
              let line = commentLines[i].trim();
              if (line.startsWith(style.middle || '')) {
                line = line.substring((style.middle || '').length).trim();
              }
              if (parseAnnotationInLine(tag, line, 0, file)) {
                annotationLineIndex = i;
                break;
              }
            }

            // Continue reading subsequent lines in the block comment
            if (annotationLineIndex !== -1) {
              for (let i = annotationLineIndex + 1; i < commentLines.length; i++) {
                let line = commentLines[i].trim();

                // Remove middle character if present
                if (line.startsWith(style.middle || '')) {
                  line = line.substring((style.middle || '').length).trim();
                }

                // Empty line ends the multi-line body
                if (line === '') break;

                // Check if this line contains another annotation - if so, stop multi-line body
                const hasAnnotation = parseAnnotationInLine(tag, line, 0, file);
                if (hasAnnotation) break;

                bodyLines.push(line);
              }

              // Join body lines if we found additional lines
              if (bodyLines.length > 1) {
                annotation.body = bodyLines.join('\n');
              }
            }
          }
        }

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
  // For block comments, we need to handle multiple lines and middle characters
  if (style.type === 'block') {
    const lines = comment.split('\n');
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      let lineStartIndex = startIndex;

      // Calculate the position of this line within the comment
      for (let i = 0; i < lineIndex; i++) {
        lineStartIndex += lines[i].length + 1; // +1 for newline
      }

      // Remove leading whitespace and middle character if present
      let trimmedIndex = 0;
      while (trimmedIndex < line.length && /\s/.test(line[trimmedIndex])) {
        trimmedIndex++;
      }

      if (trimmedIndex < line.length && style.middle && line[trimmedIndex] === style.middle) {
        trimmedIndex++;
        while (trimmedIndex < line.length && line[trimmedIndex] === ' ') {
          trimmedIndex++;
        }
      }

      const trimmedLine = line.substring(trimmedIndex);
      const annotation = parseAnnotationInLine(
        tag,
        trimmedLine,
        lineStartIndex + trimmedIndex,
        file,
      );
      if (annotation) {
        return annotation;
      }
    }
    return null;
  } else {
    // Single line comment
    return parseAnnotationInLine(tag, comment, startIndex, file);
  }
}

function parseAnnotationInLine(
  tag: string,
  text: string,
  startIndex: number,
  file: File,
): Annotation | null {
  let index = 0;

  // Look for the tag anywhere in the line
  while (index < text.length) {
    const tagIndex = text.indexOf(tag, index);
    if (tagIndex === -1) {
      return null;
    }

    // Check if this is a word boundary (not part of another word)
    if (tagIndex > 0) {
      const prevChar = text[tagIndex - 1];
      if (/[a-zA-Z0-9_]/.test(prevChar)) {
        index = tagIndex + 1;
        continue;
      }
    }

    // Check what comes after the tag
    let afterTagIndex = tagIndex + tag.length;

    // Skip whitespace after tag
    while (afterTagIndex < text.length && /\s/.test(text[afterTagIndex])) {
      afterTagIndex++;
    }

    // Expect open parenthesis
    if (afterTagIndex >= text.length || text[afterTagIndex] !== '(') {
      index = tagIndex + 1;
      continue;
    }
    afterTagIndex++; // Skip opening parenthesis

    // ID until closing parenthesis
    const idStartIndex = afterTagIndex;
    while (afterTagIndex < text.length && text[afterTagIndex] !== ')') {
      afterTagIndex++;
    }

    if (afterTagIndex >= text.length) {
      index = tagIndex + 1;
      continue;
    }

    const id = text.substring(idStartIndex, afterTagIndex);
    afterTagIndex++; // Skip closing parenthesis

    // Body is optional
    let body = '';
    if (afterTagIndex < text.length && text[afterTagIndex] === ':') {
      afterTagIndex++;

      // Skip spaces after colon
      while (afterTagIndex < text.length && text[afterTagIndex] === ' ') {
        afterTagIndex++;
      }
      body = text.substring(afterTagIndex).trimEnd();
    }

    const annotationStartIndex = startIndex + tagIndex;
    const annotationEndIndex = startIndex + afterTagIndex;
    const location = file.getLocation(annotationStartIndex);

    return {
      tag,
      id,
      body,
      location,
      startIndex: annotationStartIndex,
      endIndex: annotationEndIndex,
    };
  }

  return null;
}
