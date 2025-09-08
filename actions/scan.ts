import * as glob from 'glob';
import { parse } from '~/tags/parse';
import { File } from '~/util/file';
import { Markdown } from '~/util/markdown';
import fs from 'fs';

export type ScanResult = SpecResult | TagResult;

export interface SpecResult {
  type: 'spec';
  name: string;
  path: string;
  ids: string[];
}

export interface TagResult {
  type: 'tag';
  id: string;
  body: string;
  location: string;
}

export const DEFAULT_IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

export async function scan(input: {
  patterns: string[];
  ignore?: string[];
}): Promise<ScanResult[]> {
  const patterns = await Promise.all(input.patterns.map(maybeExpandToRecursiveGlob));

  const paths = await glob.glob(patterns, {
    absolute: true,
    ignore: input.ignore,
    nodir: true,
  });

  const results = await Promise.all(
    paths.map((path) => {
      if (path.endsWith('spec.md')) {
        return getSpecResult(path);
      } else {
        return getTagResults(path);
      }
    }),
  );

  return results.flat();
}

async function maybeExpandToRecursiveGlob(pattern: string): Promise<string> {
  if (glob.hasMagic(pattern)) {
    return pattern;
  }

  const stat = await fs.promises.stat(pattern);
  if (stat.isDirectory()) {
    return `${pattern}/**/*`;
  }

  return pattern;
}

async function getSpecResult(path: string): Promise<SpecResult> {
  const md = await Markdown.load(path);
  const name = md.getHeader();
  const ids = md.getSubheaders();
  return { type: 'spec', name, path, ids };
}

async function getTagResults(path: string): Promise<TagResult[]> {
  const file = await File.load(path);
  return parse('spec', file).map(({ id, body, location }) => ({
    type: 'tag',
    id,
    body,
    location,
  }));
}
