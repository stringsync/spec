import z from 'zod';
import type { ScanResult } from '~/actions/scan';
import type { Module } from '~/specs/module';
import { Selector } from '~/specs/selector';
import type { Spec } from '~/specs/spec';
import type { Tag } from '~/specs/tag';
import { Template } from '~/templates/template';
import { SCAN_RESULT, SELECTORS } from '~/templates/args';
import { StringBuilder } from '~/util/string-builder';

export const SCAN_TOOL_TEMPLATE = Template.dynamic({
  name: 'scan',
  description: 'renders the output for the scan MCP tool',
  input: {
    result: SCAN_RESULT,
    selectors: SELECTORS,
    pathCount: z.number(),
  },
  render: (args) => {
    const builder = new StringBuilder();
    const modules = args.result.modules;
    const orphanedTags = getOrphanedTags(args.result, args.selectors);

    renderSummary(args.pathCount, args.result, builder);

    if (modules.length > 0 || orphanedTags.length > 0) {
      builder.newline();
    }

    for (let index = 0; index < modules.length; index++) {
      const module = modules[index];
      renderModule(module, args.result, builder);
    }

    if (orphanedTags.length > 0) {
      builder.add('**Orphaned Tags**');
      builder.newline();
      builder.add('The following tags do not have a corresponding spec:');
      builder.newline();
      renderTags(orphanedTags, builder);
    }

    return builder.toString();
  },
});

function getOrphanedTags(result: ScanResult, selectors: Selector[]): Tag[] {
  const specNames = new Set(result.specs.map((s) => s.getName()));

  return result.tags
    .filter((t) => !specNames.has(t.getSpecName()))
    .filter((t) => selectors.length === 0 || selectors.some((s) => s.matches(t)));
}

function renderSummary(pathCount: number, result: ScanResult, builder: StringBuilder) {
  builder.spaced(
    'scanned',
    pathCount.toString(),
    pathCount === 1 ? 'path,' : 'paths,',
    result.modules.length.toString(),
    result.modules.length === 1 ? 'module,' : 'modules,',
    result.specs.length.toString(),
    result.specs.length === 1 ? 'spec, and' : 'specs, and',
    result.tags.length.toString(),
    result.tags.length === 1 ? 'tag' : 'tags',
  );
}

function renderModule(module: Module, result: ScanResult, builder: StringBuilder) {
  builder.indent();

  builder.spaced('module', module.getName(), module.getPath());

  const specs = result.specs.filter((s) => module.matches(s));
  renderSpecs(specs, result, builder);

  builder.outdent();
}

function renderSpecs(specs: Spec[], result: ScanResult, builder: StringBuilder) {
  builder.indent();

  for (const spec of specs) {
    builder.spaced('spec', spec.getName(), spec.getLocation());

    const tags = result.tags.filter((t) => spec.matches(t));
    renderTags(tags, builder);
  }

  builder.outdent();
}

function renderTags(tags: Tag[], builder: StringBuilder) {
  builder.indent();

  for (const tag of tags) {
    builder.spaced('tag', tag.getSpecName(), tag.getLocation());
  }

  builder.outdent();
}
