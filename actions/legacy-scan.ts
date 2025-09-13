import * as glob from 'glob';
import { parse } from '~/parsing/parse';
import { File } from '~/util/file';
import { Markdown } from '~/util/markdown';
import fs from 'fs';
import { check } from '~/actions/check';
import { Scope } from '~/specs/scope';

export type ScanResult = {
  specs: SpecResult[];
  tags: TagResult[];
};

export interface SpecResult {
  type: 'spec';
  name: string;
  path: string;
  ids: string[];
  errors: string[];
  markdown: Markdown;
}

export interface TagResult {
  type: 'tag';
  id: string;
  body: string;
  location: string;
}

export const DEFAULT_PATTERNS = ['**/*'];
export const DEFAULT_IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

// spec(spec.scope): input now uses a Scope[].
export async function legacyScan(input: { scopes: Scope[] }): Promise<ScanResult> {
  const pathSet = new Set<string>();

  for (const scope of input.scopes) {
    const patterns = await Promise.all(scope.getIncludePatterns().map(maybeExpandToRecursiveGlob));

    if (patterns.length === 0) {
      continue;
    }

    const scopePaths = await glob.glob(patterns, {
      absolute: true,
      ignore: scope.getExcludePatterns(),
      nodir: true,
    });

    for (const p of scopePaths) {
      pathSet.add(p);
    }
  }

  const paths = Array.from(pathSet);

  const results = await Promise.all(
    paths.map((path) => {
      if (path.endsWith('spec.md')) {
        return getSpecResult(path);
      } else {
        return getTagResults(path);
      }
    }),
  );

  const specs = results.flat().filter((r): r is SpecResult => r.type === 'spec');
  const tags = results.flat().filter((r): r is TagResult => r.type === 'tag');

  return { specs, tags };
}

async function maybeExpandToRecursiveGlob(pattern: string): Promise<string> {
  if (glob.hasMagic(pattern)) {
    return pattern;
  }

  try {
    const stat = await fs.promises.stat(pattern);
    if (stat.isDirectory()) {
      return `${pattern}/**/*`;
    }
  } catch {
    return pattern;
  }

  return pattern;
}

async function getSpecResult(path: string): Promise<SpecResult> {
  const markdown = await Markdown.load(path);
  const name = markdown.getHeader();
  const ids = markdown.getSubheaders();

  const checkResult = await check({ path });
  let errors: string[];
  switch (checkResult.type) {
    case 'success':
      errors = [];
      break;
    case 'error':
      errors = checkResult.errors;
      break;
  }

  return { type: 'spec', name, path, ids, markdown, errors };
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
