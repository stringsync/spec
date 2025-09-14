import type { ScanResult } from '~/actions/scan';
import type { Scope } from '~/specs/scope';
import type { Spec } from '~/specs/spec';
import type { Tag } from '~/specs/tag';
import { StringBuilder } from '~/util/string-builder';

export class ShowToolTemplate {
  constructor(private result: ScanResult) {}

  render(): string {
    const builder = new StringBuilder();

    this.renderSummary(builder);

    if (this.result.specs.length > 0) {
      builder.newline();
      this.renderSpecs(this.result.specs, builder);
    }

    return builder.toString();
  }

  private renderSummary(builder: StringBuilder) {
    builder.spaced(
      'found',
      this.result.specs.length.toString(),
      this.result.specs.length === 1 ? 'spec' : 'specs',
    );
  }

  private renderSpecs(specs: Spec[], builder: StringBuilder) {
    for (let index = 0; index < specs.length; index++) {
      const spec = specs[index];
      builder.add(`## ${spec.getName()}`);

      builder.newline();
      builder.add(spec.getContent());
      builder.newline();

      this.renderScope(spec.getScope(), builder);

      const tags = this.result.tags.filter((t) => spec.matches(t));
      this.renderTags(tags, builder);

      if (index < specs.length - 1) {
        builder.add('\n---\n');
      }
    }
  }

  private renderScope(scope: Scope, builder: StringBuilder) {
    builder.add('*Scope*');
    builder.newline();
    builder.add(`Included: ${scope.getIncludePatterns().join(', ')}`);
    builder.add(`Excluded: ${scope.getExcludePatterns().join(', ')}`);
    builder.newline();
  }

  private renderTags(tags: Tag[], builder: StringBuilder) {
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
}
