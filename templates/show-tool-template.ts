import z from 'zod';
import type { ScanResult } from '~/actions/scan';
import type { Scope } from '~/specs/scope';
import { Selector } from '~/specs/selector';
import type { Spec } from '~/specs/spec';
import type { Tag } from '~/specs/tag';
import { Template } from '~/templates/template';
import { SCAN_RESULT_TYPE } from '~/templates/args';
import { StringBuilder } from '~/util/string-builder';

export const SHOW_TOOL_TEMPLATE = Template.dynamic({
  name: 'show',
  description: 'renders the output for the show MCP tool',
  shape: {
    result: SCAN_RESULT_TYPE,
    selectors: z.array(z.instanceof(Selector)),
  },
  render: (args) => {
    const builder = new StringBuilder();

    renderSummary(args.result, builder);

    if (args.result.specs.length > 0) {
      builder.newline();
      renderSpecs(args.result.specs, args.result, builder);
    }

    const orphanedTags = getOrphanedTags(args.result, args.selectors);
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

function renderSummary(result: ScanResult, builder: StringBuilder) {
  builder.spaced(
    'found',
    result.specs.length.toString(),
    result.specs.length === 1 ? 'spec' : 'specs',
  );
}

function renderSpecs(specs: Spec[], result: ScanResult, builder: StringBuilder) {
  for (let index = 0; index < specs.length; index++) {
    const spec = specs[index];
    builder.add(`## ${spec.getName()}`);

    builder.newline();
    builder.add(spec.getContent());
    builder.newline();

    renderScope(spec.getScope(), builder);

    const tags = result.tags.filter((t) => spec.matches(t));
    renderTags(tags, builder);

    if (index < specs.length - 1) {
      builder.add('\n---\n');
    }
  }
}

function renderScope(scope: Scope, builder: StringBuilder) {
  builder.add('*Scope*');
  builder.newline();
  builder.add(`Included: ${scope.getIncludePatterns().join(', ')}`);
  builder.add(`Excluded: ${scope.getExcludePatterns().join(', ')}`);
  builder.newline();
}

function renderTags(tags: Tag[], builder: StringBuilder) {
  builder.add('**Tags**');
  builder.newline();

  if (tags.length === 0) {
    builder.add('_no tags_');
    builder.newline();
  } else {
    for (const tag of tags) {
      builder.add(`- ${tag.getLocation()} ${tag.getContent()}`);
    }
  }
}
