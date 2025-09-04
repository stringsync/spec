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
        : comment.inner;

    // Find annotations in this comment. Body may span multiple lines (use [\s\S]).
    const re = new RegExp(
      `\\b${escapeRegex(tag)}\\s*\\(\\s*([^\\)]+?)\\s*\\)\\s*(?::\\s*([\\s\\S]*))?`,
      'g',
    );

    let m: RegExpExecArray | null;
    while ((m = re.exec(normalized)) !== null) {
      const id = (m[1] ?? '').trim();
      let body = (m[2] ?? '').toString();
      body = cleanBody(body);

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
  let pos = 0;

  while (pos < text.length) {
    let bestIdx = -1;
    let bestStyle: Style | null = null;

    for (const s of styles) {
      const idx = text.indexOf(s.start, pos);
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
    let end = text.indexOf(bestStyle.end, afterStart);

    // For single-line comments, end token is '\n'. If not found, treat as end-of-text.
    if (end === -1) {
      end = text.length;
    }

    const inner = text.slice(afterStart, end);
    hits.push({ startIndex: start, inner, style: bestStyle });

    pos = end + bestStyle.end.length;
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
 * Clean body text:
 *
 * - Trim trailing spaces on each line
 * - Trim leading/trailing overall whitespace
 * - Preserve intentional blank lines
 */
function cleanBody(body: string): string {
  if (!body) return '';
  const lines = body.split('\n').map((l) => l.replace(/\s+$/g, ''));
  return lines.join('\n').trim();
}

/**
 * Convert a zero-based string index into a Position (zero-based line/column).
 */
function indexToPosition(index: number, text: string): Position {
  let line = 0;
  let col = 0;
  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) {
      // '\n'
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
