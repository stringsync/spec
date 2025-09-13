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
}: {
  scope: Scope;
  selectors: Selector[];
  globber: Globber;
}) {
  const paths = await globber.glob(scope);
  const files = await Promise.all(paths.map((path) => File.load(path)));
  const results = await Promise.all(files.map((file) => parse({ file, scope })));

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
