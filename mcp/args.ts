import z from 'zod';

export const SELECTORS = z
  .array(z.string())
  .describe('a list of fully qualified spec ids or spec name (e.g. "foo.bar" or "foo")');

export const ABSOLUTE_PATH = z.string().refine((path) => path.startsWith('/'), {
  message: 'Path must be absolute and start with a "/".',
});

export const INCLUDE_PATTERNS = z
  .array(ABSOLUTE_PATH)
  .describe(
    'Absolute glob patterns to scan. Prefer to use all files in the project root. ' +
      'IMPORTANT: Use absolute paths here, not relative paths.',
  );

export const EXCLUDE_PATTERNS = z
  .array(ABSOLUTE_PATH)
  .optional()
  .default([])
  .describe('Absolute glob patterns to ignore. Prefer to leave this blank.');

export const TAG_FILTERS = z
  .array(z.string())
  .optional()
  .default([])
  .describe('A list of case-insensitive substrings to filter tag content by. It is an OR filter.');
