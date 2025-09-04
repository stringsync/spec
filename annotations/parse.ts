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

export function parse(tag: string, file: File): Annotation[] {
  const styles = CommentStyle.for(file);
  if (styles.length === 0) {
    return [];
  }

  const comments = extractComments(file.text, styles);

  const results: Annotation[] = [];
  for (const comment of comments) {
    const normalized =
      comment.style.type === 'block'
        ? normalizeBlockContent(comment.inner, comment.style.middle ?? '')
        : normalizeSingleContent(comment.inner);

    // Find annotations in this comment. Body may span multiple lines (use [\s\S]).
    const re = new RegExp(
      `\\b${escapeRegex(tag)}\\s*\\(\\s*([^\\)]+?)\\s*\\)\\s*(?::\\s*([\\s\\S]*))?`,
      'g',
    );

    let m: RegExpExecArray | null;
    while ((m = re.exec(normalized)) !== null) {
      const id = (m[1] ?? '').trim();
      let body = (m[2] ?? '').toString();
      body = cleanBody(body, comment.style);

      const location = file.getLocation(indexToPosition(comment.startIndex, file.text));
      results.push({ tag, id, body, location });
    }
  }

  return results;
}

/**
 * Extract all comment blocks for the given styles in a single forward scan,
 * preferring longer start tokens when multiple match at the same index (e.g., '/**' over '/*').
 */
function extractComments(text: string, styles: Style[]): CommentHit[] {
  const hits: CommentHit[] = [];
  let index = 0;

  while (index < text.length) {
    let bestIdx = -1;
    let bestStyle: Style | null = null;

    for (const s of styles) {
      const idx = text.indexOf(s.start, index);
      if (idx === -1) continue;
      if (
        bestIdx === -1 ||
        idx < bestIdx ||
        (idx === bestIdx && s.start.length > (bestStyle?.start.length ?? 0))
      ) {
        bestIdx = idx;
        bestStyle = s;
      }
    }

    if (bestIdx === -1 || !bestStyle) break;

    const start = bestIdx;
    const afterStart = start + bestStyle.start.length;
    if (bestStyle.type === 'single') {
      // Group consecutive single-line comments of the same style into one logical comment.
      let lineEnd = text.indexOf('\n', afterStart);
      if (lineEnd === -1) lineEnd = text.length;

      let inner = text.slice(afterStart, lineEnd);
      let scan = lineEnd < text.length ? lineEnd + 1 : lineEnd;

      const startPattern = new RegExp(`^\\s*${escapeRegex(bestStyle.start)}(.*)$`);

      while (scan < text.length) {
        let nextLineEnd = text.indexOf('\n', scan);
        if (nextLineEnd === -1) nextLineEnd = text.length;

        const line = text.slice(scan, nextLineEnd);
        const match = line.match(startPattern);
        if (!match) break;

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

/**
 * Normalize the inside of block comments by removing leading "middle" characters like '*'
 * and a following space if present (e.g., ' * ' -> '').
 */
function normalizeBlockContent(content: string, middle: string): string {
  if (!middle) {
    // For block styles without a middle (e.g., triple quotes), keep as-is.
    return content;
  }
  const middleRe = new RegExp(`^\\s*${escapeRegex(middle)}\\s?`);
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
function cleanBody(body: string, style: Style): string {
  if (!body) return '';

  // Remove leading whitespace right after the colon but keep internal indentation/newlines.
  const s = body.replace(/^\s*/, '');

  // Right-trim each line
  let lines = s.split('\n').map((l) => l.replace(/\s+$/g, ''));

  // For JSDoc-style block comments, stop at the first blank line.
  let cutAtBlank = false;
  if (style.type === 'block' && !!style.middle) {
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
function indexToPosition(index: number, text: string): Position {
  let line = 0;
  let col = 0;
  for (let i = 0; i < index; i++) {
    if (text.charAt(i) === '\n') {
      line++;
      col = 0;
    } else {
      col++;
    }
  }
  return new Position({ line, column: col });
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
