import { File } from '~/util/file';
import { Module } from '~/specs/module';
import { Spec } from '~/specs/spec';
import { parse } from '~/parsing/parse';
import type { Globber } from '~/util/globber/globber';
import type { Scope } from '~/specs/scope';
import { Tag } from '~/specs/tag';
import type { Selector } from '~/specs/selector';

export interface ScanResult {
  modules: Module[];
  specs: Spec[];
  tags: Tag[];
}

interface ParseResult {
  modules: Module[];
  specs: Spec[];
  tags: Tag[];
}

export async function scan({
  scope,
  selectors,
  globber,
}: {
  scope: Scope;
  selectors: Selector[];
  globber: Globber;
}) {
  const paths = await globber.glob(scope);
  const results = await Promise.all(paths.map((path) => parseFile(path, scope)));

  const modules = results
    .flatMap((r) => r.modules)
    .filter((module) => selectors.some((s) => s.matches(module)));
  const specs = results
    .flatMap((r) => r.specs)
    .filter((spec) => selectors.some((s) => s.matches(spec)));
  const tags = results
    .flatMap((r) => r.tags)
    .filter((tag) => selectors.some((s) => s.matches(tag)));

  return { modules, specs, tags };
}

async function parseFile(path: string, scope: Scope): Promise<ParseResult> {
  if (path.endsWith('spec.md')) {
    // TODO: A module can also contain tags, so we need to parse those too.
    const [module, specs] = await parseModule(path, scope);
    return { modules: [module], specs, tags: [] };
  } else {
    const tags = await parseTags(path);
    return { modules: [], specs: [], tags };
  }
}

async function parseModule(path: string, scope: Scope): Promise<[module: Module, specs: Spec[]]> {
  const module = await Module.load(path, scope);
  const markdown = module.getMarkdown();

  const text = markdown.getContent();
  const file = new File(path, text);

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

async function parseTags(path: string): Promise<Tag[]> {
  const file = await File.load(path);
  const results = parse('spec', file);
  // TODO: Just return the results when parse returns Tag[]
  return results.map(
    (tag) =>
      new Tag({
        path,
        specName: tag.id,
        moduleName: tag.id.split('.')[0],
        content: tag.body,
        location: tag.location,
      }),
  );
}
