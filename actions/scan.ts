import { glob } from 'glob';
import { parse } from '~/annotations/parse';
import { File } from '~/util/file';
import { Markdown } from '~/util/markdown';

export type ScanResult = SpecResult | AnnotationResult;

export interface SpecResult {
  type: 'spec';
  name: string;
  path: string;
  ids: string[];
}

export interface AnnotationResult {
  type: 'annotation';
  id: string;
  body: string;
  location: string;
}

const IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

export async function scan(input: { patterns: string[] }): Promise<ScanResult[]> {
  const paths = await glob(input.patterns, {
    absolute: true,
    ignore: IGNORE_PATTERNS,
    nodir: true,
  });

  const results = await Promise.all(
    paths.map((path) => {
      if (path.endsWith('spec.md')) {
        return getSpecResult(path);
      } else {
        return getAnnotationResults(path);
      }
    }),
  );

  return results.flat();
}

async function getSpecResult(path: string): Promise<SpecResult> {
  const md = await Markdown.load(path);
  const name = md.getHeader();
  const ids = md.getSubheaders();
  return { type: 'spec', name, path, ids };
}

async function getAnnotationResults(path: string): Promise<AnnotationResult[]> {
  const file = await File.load(path);
  return parse('spec', file).map(({ id, body, location }) => ({
    type: 'annotation',
    id,
    body,
    location,
  }));
}
