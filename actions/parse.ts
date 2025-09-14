import { CommentStyle } from '~/util/comment-style';
import { Module } from '~/specs/module';
import { Scope } from '~/specs/scope';
import { Spec } from '~/specs/spec';
import { Tag } from '~/specs/tag';
import { File } from '~/util/file';
import { Markdown } from '~/util/markdown';

export interface ParseResult {
  modules: Module[];
  specs: Spec[];
  tags: Tag[];
}

interface TagData {
  moduleName: string;
  specName: string;
  content: string;
  location: string;
  startIndex: number;
  endIndex: number;
}

interface CommentData {
  text: string;
  startIndex: number;
  endIndex: number;
}

export function parse({
  file,
  scope,
  styles,
}: {
  file: File;
  scope?: Scope;
  styles?: CommentStyle[];
}): ParseResult {
  scope ??= Scope.all();
  styles ??= CommentStyle.for(file);

  if (file.path.endsWith('spec.md')) {
    const [module, specs] = parseModule(file, scope);
    return { modules: [module], specs, tags: [] };
  } else {
    const tags = parseTags('spec', file, styles);
    return { modules: [], specs: [], tags };
  }
}

function parseModule(file: File, scope: Scope): [Module, Spec[]] {
  const markdown = new Markdown(file.text);
  const module = new Module(file.path, markdown, scope);
  const text = markdown.getContent();

  const specs = new Array<Spec>();

  for (const subheader of markdown.getSubheaders()) {
    const index = text.indexOf(`## ${subheader}`);
    const spec = new Spec({
      scope,
      name: subheader,
      content: markdown.getSubheaderContent(subheader),
      moduleName: module.getName(),
      path: module.getPath(),
      location: file.getLocation(index),
    });
    specs.push(spec);
  }

  return [module, specs];
}

function parseTags(tagName: string, file: File, styles: CommentStyle[]): Tag[] {
  if (styles.length === 0) {
    return [];
  }

  const tags = new Array<TagData>();

  // Track processed positions to avoid duplicate tags
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
        index = startIndex + Math.max(style.start.length, 1);
        continue;
      }

      index = startIndex + style.start.length;

      const comment = parseComment(index, file, style);
      const commentStartIndex = startIndex + style.start.length;

      // Mark this position as processed to avoid duplicate processing
      processedPositions.add(startIndex);

      // Parse all tags in this comment
      const commentTags = parseAllTags(tagName, comment.text, commentStartIndex, file, style);

      // Handle multi-line bodies for each tag
      for (const tag of commentTags) {
        if (tag.content !== '') {
          if (style.type === 'single') {
            // Handle multi-line body for single-line comments
            const bodyLines = [tag.content];
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

              // Check if this line contains another tag - if so, stop multi-line body
              const hasTag = parseTagInLine(tagName, nextCommentText, 0, file);
              if (hasTag) break;

              bodyLines.push(nextCommentText);
              nextIndex = nextComment.endIndex;
            }

            // Join body lines if we found additional lines
            if (bodyLines.length > 1) {
              tag.content = bodyLines.join('\n');
            }
          } else {
            // Handle multi-line body for block comments
            const bodyLines = [tag.content];
            const commentLines = comment.text.split('\n');

            // Find which line contains this specific tag
            let tagLineIndex = -1;
            for (let i = 0; i < commentLines.length; i++) {
              let line = commentLines[i].trim();
              if (line.startsWith(style.middle || '')) {
                line = line.substring((style.middle || '').length).trim();
              }
              const lineTag = parseTagInLine(tagName, line, 0, file);
              if (lineTag && lineTag.specName === tag.specName) {
                tagLineIndex = i;
                break;
              }
            }

            // Continue reading subsequent lines in the block comment
            if (tagLineIndex !== -1) {
              for (let i = tagLineIndex + 1; i < commentLines.length; i++) {
                let line = commentLines[i].trim();

                // Remove middle character if present
                if (line.startsWith(style.middle || '')) {
                  line = line.substring((style.middle || '').length).trim();
                }

                // Empty line ends the multi-line body
                if (line === '') break;

                // Check if this line contains another tag - if so, stop multi-line body
                const hasTag = parseTagInLine(tagName, line, 0, file);
                if (hasTag) break;

                bodyLines.push(line);
              }

              // Join body lines if we found additional lines
              if (bodyLines.length > 1) {
                tag.content = bodyLines.join('\n');
              }
            }
          }
        }

        tags.push(tag);
      }

      index = comment.endIndex;
    }
  }

  return tags
    .sort((a, b) => a.startIndex - b.startIndex)
    .map(
      (t) =>
        new Tag({
          specName: t.specName,
          moduleName: t.moduleName,
          content: t.content,
          path: file.path,
          location: t.location,
        }),
    );
}

function parseComment(startIndex: number, file: File, style: CommentStyle): CommentData {
  let endIndex: number;
  let text: string;
  if (style.type === 'single') {
    endIndex = file.text.indexOf(style.end, startIndex);
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

function parseAllTags(
  tagName: string,
  comment: string,
  startIndex: number,
  file: File,
  style: CommentStyle,
): TagData[] {
  const tags: TagData[] = [];

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

      // Find all tags in this line
      const lineTags = parseAllTagsInLine(
        tagName,
        trimmedLine,
        lineStartIndex + trimmedIndex,
        file,
      );
      tags.push(...lineTags);
    }
  } else {
    // Single line comment - find all tags in the line
    const lineTags = parseAllTagsInLine(tagName, comment, startIndex, file);
    tags.push(...lineTags);
  }

  return tags;
}

function parseAllTagsInLine(
  tagName: string,
  text: string,
  startIndex: number,
  file: File,
): TagData[] {
  const tags = new Array<TagData>();
  let index = 0;

  // Look for all occurrences of the tag in the line
  while (index < text.length) {
    const tagIndex = text.indexOf(tagName, index);
    if (tagIndex === -1) {
      break;
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
    let afterTagIndex = tagIndex + tagName.length;

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

    const specName = text.substring(idStartIndex, afterTagIndex);
    afterTagIndex++; // Skip closing parenthesis

    // Body is optional
    let content = '';
    if (afterTagIndex < text.length && text[afterTagIndex] === ':') {
      afterTagIndex++;

      // Skip spaces after colon
      while (afterTagIndex < text.length && text[afterTagIndex] === ' ') {
        afterTagIndex++;
      }
      content = text.substring(afterTagIndex).trimEnd();
    }

    const moduleName = specName.split('.')[0];
    const tagStartIndex = startIndex + tagIndex;
    const tagEndIndex = startIndex + afterTagIndex;
    const location = file.getLocation(tagStartIndex);

    tags.push({
      specName,
      moduleName,
      content,
      location,
      startIndex: tagStartIndex,
      endIndex: tagEndIndex,
    });

    // Continue searching after this tag
    index = afterTagIndex;
  }

  return tags;
}

function parseTagInLine(
  tagName: string,
  text: string,
  startIndex: number,
  file: File,
): TagData | null {
  let index = 0;

  // Look for the tag anywhere in the line
  while (index < text.length) {
    const tagIndex = text.indexOf(tagName, index);
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
    let afterTagIndex = tagIndex + tagName.length;

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

    const specName = text.substring(idStartIndex, afterTagIndex);
    afterTagIndex++; // Skip closing parenthesis

    // Body is optional
    let content = '';
    if (afterTagIndex < text.length && text[afterTagIndex] === ':') {
      afterTagIndex++;

      // Skip spaces after colon
      while (afterTagIndex < text.length && text[afterTagIndex] === ' ') {
        afterTagIndex++;
      }
      content = text.substring(afterTagIndex).trimEnd();
    }

    const moduleName = specName.split('.')[0];
    const tagStartIndex = startIndex + tagIndex;
    const tagEndIndex = startIndex + afterTagIndex;
    const location = file.getLocation(tagStartIndex);

    return {
      moduleName,
      specName,
      content,
      location,
      startIndex: tagStartIndex,
      endIndex: tagEndIndex,
    };
  }

  return null;
}
