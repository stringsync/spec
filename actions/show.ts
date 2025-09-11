import type { Markdown } from '~/util/markdown';

export interface Spec {
  name: string;
  path: string;
  ids: string[];
  markdown: Markdown;
}

export interface Tag {
  id: string;
  body: string;
  location: string;
}

export type ShowResult =
  | {
      type: 'success';
      content: string;
    }
  | {
      type: 'error';
      errors: string[];
    };

export function show(input: { selectors: string[]; specs: Spec[]; tags: Tag[] }): ShowResult {
  const selectors = unique(input.selectors);
  const errors = selectors.flatMap(validate);
  if (errors.length > 0) {
    return { type: 'error', errors };
  }

  if (selectors.length === 0) {
    return { type: 'error', errors: ['at least one selector is required'] };
  }

  const contentById: Record<string, string> = {};
  const ids = toIds(selectors, input.specs);

  for (const id of ids) {
    const specs = input.specs.filter((s) => s.ids.includes(id));
    const tags = input.tags.filter((t) => t.id === id);

    const content = new Array<string>();

    if (specs.length === 0) {
      content.push(`## ${id}`);
      content.push(`_subspec ${id} not found_`);
    }

    for (let index = 0; index < specs.length; index++) {
      const spec = specs[index];
      if (specs.length > 1) {
        content.push(`## ${id} (${index}/${specs.length - 1})`);
      } else {
        content.push(`## ${id}`);
      }
      content.push(spec.path);
      content.push(spec.markdown.getSubheaderContent(id));
    }

    content.push('**tags**');
    if (tags.length === 0) {
      content.push('_none_');
    } else {
      for (const tag of tags) {
        content.push(`- ${tag.location} ${tag.body}`);
      }
    }

    contentById[id] = content.join('\n\n');
  }

  const content = new Array<string>();

  // Preserve the order of the requested ids.
  for (const id of ids) {
    if (contentById[id]) {
      content.push(contentById[id]);
    }
  }

  if (content.length === 0) {
    return { type: 'error', errors: ['no specs or tags found'] };
  } else {
    return { type: 'success', content: content.join('\n\n') };
  }
}

function unique<T>(array: T[]): T[] {
  const result = new Array<T>();
  const seen = new Set<T>();
  for (const item of array) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

function validate(selector: string): string[] {
  const errors = new Array<string>();

  const parts = selector.split('.');
  if (parts.length > 2) {
    return [`selector must have the format <spec>.<id> or <spec>, got: ${selector}`];
  }

  return errors;
}

function toIds(selectors: string[], specs: Spec[]): string[] {
  const ids = new Array<string>();
  const seen = new Set<string>();
  function add(...candidateIds: string[]) {
    for (const candidateId of candidateIds) {
      if (!seen.has(candidateId)) {
        seen.add(candidateId);
        ids.push(candidateId);
      }
    }
  }

  for (const selector of selectors) {
    const [specName, id] = selector.split('.');
    const matches = specs.filter((s) => s.name === specName);
    if (typeof id === 'undefined') {
      add(...matches.flatMap((s) => s.ids));
    } else {
      add(selector);
    }
  }

  return ids;
}
