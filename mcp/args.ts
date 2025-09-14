import z from 'zod';

export const SELECTORS = z
  .array(z.string())
  .describe('a list of fully qualified spec ids or spec name (e.g. "foo.bar" or "foo")');

export const INCLUDE_PATTERNS = z
  .array(z.string())
  .describe('absolute glob patterns to scan, prefer to use all files in the project root');

export const EXCLUDE_PATTERNS = z
  .array(z.string())
  .optional()
  .default([])
  .describe('absolute glob patterns to ignore, prefer to leave this blank');
