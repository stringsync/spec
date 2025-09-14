import type { ScanResult } from '~/actions/scan';
import type { Module } from '~/specs/module';
import type { Selector } from '~/specs/selector';
import type { Spec } from '~/specs/spec';
import type { Tag } from '~/specs/tag';
import { StringBuilder } from '~/util/string-builder';

export class ScanToolTemplate {
  constructor(
    private result: ScanResult,
    private selectors: Selector[],
    private pathCount: number,
  ) {}

  render(): string {
    const builder = new StringBuilder();

    this.renderSummary(builder);

    for (let index = 0; index < this.result.modules.length; index++) {
      const module = this.result.modules[index];
      this.renderModule(module, builder);
    }

    const orphanedTags = this.getOrphanedTags();
    if (orphanedTags.length > 0) {
      builder.add('**Orphaned Tags**');
      builder.newline();
      builder.add('The following tags do not have a corresponding spec:');
      builder.newline();
      this.renderTags(orphanedTags, builder);
    }

    return builder.toString();
  }

  private renderSummary(builder: StringBuilder) {
    builder.spaced(
      'scanned',
      this.pathCount.toString(),
      this.pathCount === 1 ? 'path,' : 'paths,',
      this.result.modules.length.toString(),
      this.result.modules.length === 1 ? 'module,' : 'modules,',
      this.result.specs.length.toString(),
      this.result.specs.length === 1 ? 'spec, and' : 'specs, and',
      this.result.tags.length.toString(),
      this.result.tags.length === 1 ? 'tag' : 'tags',
    );
  }

  private renderModule(module: Module, builder: StringBuilder) {
    builder.indent();

    builder.spaced('module', module.getName(), module.getPath());

    const specs = this.result.specs.filter((s) => module.matches(s));
    this.renderSpecs(specs, builder);

    builder.outdent();
  }

  private renderSpecs(specs: Spec[], builder: StringBuilder) {
    builder.indent();

    for (const spec of specs) {
      builder.spaced('spec', spec.getName(), spec.getLocation());

      const tags = this.result.tags.filter((t) => spec.matches(t));
      this.renderTags(tags, builder);
    }

    builder.outdent();
  }

  private renderTags(tags: Tag[], builder: StringBuilder) {
    builder.indent();

    for (const tag of tags) {
      builder.spaced('tag', tag.getSpecName(), tag.getLocation());
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
