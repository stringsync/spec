import { CommentStyle } from '~/annotations/comment-style';
import type { Annotation } from '~/annotations/types';
import type { File } from '~/files/file';
import { Position } from '~/files/position';

type Style = CommentStyle;

interface CommentHit {
  startIndex: number;
  inner: string;
  style: Style;
}

/**
 * Parse all annotations with the given tag from the file.
 */
export function parse(tag: string, file: File): Annotation[] {
  const styles = CommentStyle.for(file);
  const comments = extractComments(file.text, styles);
  return extractAnnotations(tag, comments, file);
}

/**
 * Extract all comment blocks for the given styles in a single forward scan,
 * preferring longer start tokens when multiple match at the same index (e.g., '/**' over '/*').
 */
function extractComments(text: string, styles: Style[]): CommentHit[] {
  if (styles.length === 0) {
    return [];
  }

  const hits: CommentHit[] = [];
  let index = 0;

  while (index < text.length) {
    let bestIndex = -1;
    let bestStyle: Style | null = null;

    for (const style of styles) {
      const styleIndex = text.indexOf(style.start, index);
      if (styleIndex === -1) {
        continue;
      }
      if (
        bestIndex === -1 ||
        styleIndex < bestIndex ||
        (styleIndex === bestIndex && style.start.length > (bestStyle?.start.length ?? 0))
      ) {
        bestIndex = styleIndex;
        bestStyle = style;
      }
    }

    if (bestIndex === -1 || !bestStyle) {
      break;
    }

    const start = bestIndex;
    const afterStart = start + bestStyle.start.length;
    if (bestStyle.type === 'single') {
      // Group consecutive single-line comments of the same style into one logical comment.
      let lineEnd = text.indexOf('\n', afterStart);
      if (lineEnd === -1) {
        lineEnd = text.length;
      }

      let inner = text.slice(afterStart, lineEnd);
      let scan = lineEnd < text.length ? lineEnd + 1 : lineEnd;

      const startPattern = new RegExp(`^\\s*${escapeRegex(bestStyle.start)}(.*)$`);

      while (scan < text.length) {
        let nextLineEnd = text.indexOf('\n', scan);
        if (nextLineEnd === -1) {
          nextLineEnd = text.length;
        }

        const line = text.slice(scan, nextLineEnd);
        const match = line.match(startPattern);
        if (!match) {
          break;
        }

        inner += '\n' + match[1];
        scan = nextLineEnd < text.length ? nextLineEnd + 1 : nextLineEnd;
      }

      hits.push({ startIndex: start, inner, style: bestStyle });
      index = scan;
    } else {
      let end = text.indexOf(bestStyle.end, afterStart);
      if (end === -1) {
        end = text.length;
      }

      const inner = text.slice(afterStart, end);
      hits.push({ startIndex: start, inner, style: bestStyle });

      index = end + bestStyle.end.length;
    }
  }

  return hits;
}

function extractAnnotations(tag: string, comments: CommentHit[], file: File): Annotation[] {
  const annotations = new Array<Annotation>();

  for (const comment of comments) {
    const normalized = normalizeContent(comment.inner, comment.style);

    // Find annotations in this comment. Body may span multiple lines (use [\s\S]).
    const re = new RegExp(
      `\\b${escapeRegex(tag)}\\s*\\(\\s*([^\\)]+?)\\s*\\)\\s*(?::\\s*([\\s\\S]*))?`,
      'g',
    );

    let m: RegExpExecArray | null;
    while ((m = re.exec(normalized)) !== null) {
      const id = (m[1] ?? '').trim();
      let body = (m[2] ?? '').toString();
      body = cleanAnnotationBody(body, comment.style);

      const position = toPosition(comment.startIndex, file.text);
      const location = file.getLocation(position);
      if (id) {
        annotations.push({ tag, id, body, location });
      }
    }
  }

  return annotations;
}

function normalizeContent(content: string, style: CommentStyle): string {
  switch (style.type) {
    case 'block':
      return normalizeBlockContent(content, style);
    case 'single':
      return normalizeSingleContent(content);
  }
}

/**
 * Normalize the inside of block comments by removing leading "middle" characters like '*'
 * and a following space if present (e.g., ' * ' -> '').
 */
function normalizeBlockContent(content: string, style: CommentStyle): string {
  if (!style.middle) {
    // For block styles without a middle (e.g., triple quotes), keep as-is.
    return content;
  }
  const middleRe = new RegExp(`^\\s*${escapeRegex(style.middle)}\\s?`);
  return content
    .split('\n')
    .map((line) => line.replace(middleRe, ''))
    .join('\n');
}

/**
 * Normalize the inside of grouped single-line comments by removing a single leading space
 * from each line (common style is '// ').
 */
function normalizeSingleContent(content: string): string {
  return content
    .split('\n')
    .map((line) => line.replace(/^ /, ''))
    .join('\n');
}

/**
 * Clean body text:
 * - Remove only the leading whitespace after the colon
 * - Trim trailing spaces on each line
 * - For block comments with a middle marker (e.g. '/**' '*'), stop at the first blank line
 * - Preserve a single trailing newline for such block comments if present and not cut by a blank line
 */
function cleanAnnotationBody(body: string, style: Style): string {
  if (!body) {
    return '';
  }

  // Remove leading whitespace right after the colon but keep internal indentation/newlines.
  const s = body.replace(/^\s*/, '');

  // Right-trim each line
  let lines = s.split('\n').map((l) => l.replace(/\s+$/g, ''));

  // Stop at the first blank line for:
  // - JSDoc-style block comments (block with middle marker)
  // - Grouped single-line comments (e.g., //)
  let cutAtBlank = false;
  if ((style.type === 'block' && !!style.middle) || style.type === 'single') {
    const firstBlank = lines.findIndex((l) => l.trim() === '');
    if (firstBlank !== -1) {
      lines = lines.slice(0, firstBlank);
      cutAtBlank = true;
    }
  }

  let result = lines.join('\n');

  // Preserve a single trailing newline if it existed and we didn't cut at a blank line.
  if (!cutAtBlank && style.type === 'block' && !!style.middle && s.endsWith('\n')) {
    result += '\n';
  }

  return result;
}

/**
 * Convert a zero-based string index into a Position (zero-based line/column).
 */
function toPosition(index: number, text: string): Position {
  let line = 0;
  let column = 0;
  for (let i = 0; i < index; i++) {
    if (text.charAt(i) === '\n') {
      line++;
      column = 0;
    } else {
      column++;
    }
  }
  return new Position({ line, column });
}

/**
 * Escapes special characters in a string to be used safely within a regular expression.
 *
 * This function replaces characters that have special meaning in regular expressions
 * (such as `.`, `*`, `+`, `?`, `^`, `$`, `{`, `}`, `(`, `)`, `|`, `[`, `]`, `\`)
 * with their escaped counterparts.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
