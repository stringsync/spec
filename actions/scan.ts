import { Module } from '~/specs/module';
import { Spec } from '~/specs/spec';
import { Tag } from '~/specs/tag';
import type { Globber } from '~/util/globber/globber';
import type { Scope } from '~/specs/scope';
import type { Selector } from '~/specs/selector';
import { parse } from '~/actions/parse';
import { File } from '~/util/file';

export interface ScanResult {
  modules: Module[];
  specs: Spec[];
  tags: Tag[];
}

export async function scan({
  scope,
  selectors,
  globber,
  tagFilters,
}: {
  scope: Scope;
  selectors: Selector[];
  globber: Globber;
  tagFilters: string[];
}) {
  const paths = await globber.glob(scope);
  const files = await Promise.all(paths.map((path) => File.load(path)));
  const results = await Promise.all(files.map((file) => parse({ file, scope })));

  const modules = results.flatMap((r) => r.modules);
  const specs = results.flatMap((r) => r.specs);
  const tags = results.flatMap((r) => r.tags);

  let result: ScanResult = { modules, specs, tags };
  result = filterSelectors(result, selectors);
  result = filterTagContents(result, tagFilters);

  return result;
}

function filterSelectors(result: ScanResult, selectors: Selector[]): ScanResult {
  if (selectors.length === 0) {
    return result;
  }

  function matchesSelectors(target: Module | Spec | Tag): boolean {
    return selectors.some((s) => s.matches(target));
  }

  result.modules = result.modules.filter(matchesSelectors);
  result.specs = result.specs.filter(matchesSelectors);
  result.tags = result.tags.filter(matchesSelectors);

  return result;
}

function filterTagContents(result: ScanResult, tagFilters: string[]): ScanResult {
  if (tagFilters.length === 0) {
    return result;
  }

  const tags = result.tags.filter((t) =>
    tagFilters.some((f) => t.getContent().toLowerCase().includes(f.toLowerCase())),
  );
  const moduleNames = new Set(tags.map((t) => t.getModuleName()));
  const specNames = new Set(tags.map((t) => t.getSpecName()));

  result.modules = result.modules.filter((m) => moduleNames.has(m.getName()));
  result.specs = result.specs.filter((s) => specNames.has(s.getName()));
  result.tags = tags;

  return result;
}
