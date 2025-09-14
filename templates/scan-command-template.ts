import chalk from 'chalk';
import type { ScanResult } from '~/actions/scan';
import type { Module } from '~/specs/module';
import type { Selector } from '~/specs/selector';
import type { Spec } from '~/specs/spec';
import type { Tag } from '~/specs/tag';
import { StringBuilder } from '~/util/string-builder';

export class ScanCommandTemplate {
  constructor(
    private result: ScanResult,
    private selectors: Selector[],
    private pathCount: number,
    private ms: number,
  ) {}

  render(): string {
    const builder = new StringBuilder();
    const modules = this.result.modules;
    const orphanedTags = this.getOrphanedTags();

    this.renderSummary(builder);

    if (modules.length > 0 || orphanedTags.length > 0) {
      builder.newline();
    }

    for (let index = 0; index < modules.length; index++) {
      const module = modules[index];
      this.renderModule(module, builder);

      if (index < modules.length - 1) {
        builder.newline();
      }
    }

    if (orphanedTags.length > 0) {
      builder.add(chalk.red('orphaned'));
      this.renderTagsWithSpecNames(orphanedTags, builder);
    }

    return builder.toString();
  }

  private renderSummary(builder: StringBuilder) {
    builder.spaced(
      chalk.blue('scanned'),
      chalk.white.bold(this.pathCount.toString()),
      this.pathCount === 1 ? 'file,' : 'files,',
      chalk.white.bold(this.result.modules.length.toString()),
      this.result.modules.length === 1 ? 'module,' : 'modules,',
      chalk.white.bold(this.result.specs.length.toString()),
      this.result.specs.length === 1 ? 'spec, and' : 'specs, and',
      chalk.white.bold(this.result.tags.length.toString()),
      this.result.tags.length === 1 ? 'tag' : 'tags',
      chalk.gray(`in [${this.ms.toFixed(2)}ms]`),
    );
  }

  private renderModule(module: Module, builder: StringBuilder) {
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
      this.renderErrors(errors, builder);
    }

    const specs = this.result.specs.filter((s) => module.matches(s));
    this.renderSpecs(specs, builder);
  }

  private renderErrors(errors: string[], builder: StringBuilder) {
    builder.indent();

    for (const error of errors) {
      builder.spaced(chalk.red('error:'), chalk.gray(error));
    }

    builder.outdent();
  }

  private renderSpecs(specs: Spec[], builder: StringBuilder) {
    builder.indent();

    for (const spec of specs) {
      builder.spaced(
        chalk.magenta('spec:'),
        chalk.white.bold(spec.getName()),
        chalk.cyan(spec.getLocation()),
      );
      const tags = this.result.tags.filter((t) => spec.matches(t));
      this.renderTags(tags, builder);
    }

    builder.outdent();
  }

  private renderTags(tags: Tag[], builder: StringBuilder) {
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

  private renderTagsWithSpecNames(tags: Tag[], builder: StringBuilder) {
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

  private getOrphanedTags(): Tag[] {
    const specNames = new Set(this.result.specs.map((s) => s.getName()));

    return this.result.tags
      .filter((t) => !specNames.has(t.getSpecName()))
      .filter((t) => this.selectors.length === 0 || this.selectors.some((s) => s.matches(t)));
  }
}
