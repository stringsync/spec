import chalk from 'chalk';
import z from 'zod';
import type { ScanResult } from '~/actions/scan';
import type { Module } from '~/specs/module';
import { Selector } from '~/specs/selector';
import type { Spec } from '~/specs/spec';
import type { Tag } from '~/specs/tag';
import { Template } from '~/templates/template';
import { SCAN_RESULT } from '~/templates/args';
import { StringBuilder } from '~/util/string-builder';
import { SELECTORS } from '~/templates/args';

export const SCAN_COMMAND_TEMPLATE = Template.dynamic({
  name: 'scan',
  description: 'renders the output for the scan command',
  input: {
    result: SCAN_RESULT,
    selectors: SELECTORS,
    pathCount: z.number(),
    ms: z.number(),
  },
  render: (args) => {
    const builder = new StringBuilder();
    const modules = args.result.modules;
    const orphanedTags = getOrphanedTags(args.result, args.selectors);

    renderSummary(args.pathCount, args.result, args.ms, builder);

    if (modules.length > 0 || orphanedTags.length > 0) {
      builder.newline();
    }

    for (let index = 0; index < modules.length; index++) {
      const module = modules[index];
      renderModule(module, args.result, builder);

      if (index < modules.length - 1) {
        builder.newline();
      }
    }

    if (orphanedTags.length > 0) {
      builder.newline();
      builder.add(chalk.red('orphaned'));
      renderTagsWithSpecNames(orphanedTags, builder);
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

function renderSummary(pathCount: number, result: ScanResult, ms: number, builder: StringBuilder) {
  builder.spaced(
    chalk.blue('scanned'),
    chalk.white.bold(pathCount.toString()),
    pathCount === 1 ? 'file,' : 'files,',
    chalk.white.bold(result.modules.length.toString()),
    result.modules.length === 1 ? 'module,' : 'modules,',
    chalk.white.bold(result.specs.length.toString()),
    result.specs.length === 1 ? 'spec, and' : 'specs, and',
    chalk.white.bold(result.tags.length.toString()),
    result.tags.length === 1 ? 'tag' : 'tags',
    chalk.gray(`in [${ms.toFixed(2)}ms]`),
  );
}

function renderModule(module: Module, result: ScanResult, builder: StringBuilder) {
  let validity = '';
  const errors = module.getErrors();
  if (errors.length === 0) {
    validity = chalk.green('✓ valid');
  } else if (errors.length === 1) {
    validity = chalk.red('✗ 1 error');
  } else {
    validity = chalk.red(`✗ ${errors.length} errors`);
  }

  builder.spaced(
    chalk.yellow('module'),
    chalk.white.bold(module.getName()),
    chalk.cyan(module.getPath()),
    validity,
  );

  if (errors.length > 0) {
    renderErrors(errors, builder);
  }

  const specs = result.specs.filter((s) => module.matches(s));
  renderSpecs(specs, result, builder);
}

function renderErrors(errors: string[], builder: StringBuilder) {
  builder.indent();

  for (const error of errors) {
    builder.spaced(chalk.red('error:'), chalk.gray(error));
  }

  builder.outdent();
}

function renderSpecs(specs: Spec[], result: ScanResult, builder: StringBuilder) {
  builder.indent();

  for (const spec of specs) {
    builder.spaced(
      chalk.magenta('spec:'),
      chalk.white.bold(spec.getName()),
      chalk.cyan(spec.getLocation()),
    );
    const tags = result.tags.filter((t) => spec.matches(t));
    renderTags(tags, builder);
  }

  builder.outdent();
}

function renderTags(tags: Tag[], builder: StringBuilder) {
  builder.indent();

  for (const tag of tags) {
    builder.spaced(
      chalk.green('tag:'),
      chalk.cyan(tag.getLocation()),
      chalk.gray(tag.getContent()),
    );
  }

  builder.outdent();
}

function renderTagsWithSpecNames(tags: Tag[], builder: StringBuilder) {
  builder.indent();

  for (const tag of tags) {
    builder.spaced(
      chalk.green('tag:'),
      chalk.white.bold(tag.getSpecName()),
      chalk.cyan(tag.getLocation()),
      chalk.gray(tag.getContent()),
    );
  }

  builder.outdent();
}
