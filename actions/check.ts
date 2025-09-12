import fs from 'fs';
import path from 'path';
import { Markdown } from '~/util/markdown';

export type CheckResult = { type: 'success' } | { type: 'error'; errors: string[] };

// spec(spec.validation): TODO - move this to the specs directory
export async function check(input: { path: string }): Promise<CheckResult> {
  for await (const errors of generateErrors(input.path)) {
    if (errors.length > 0) {
      return error(errors);
    }
  }

  return success();
}

function success() {
  return { type: 'success' } as const;
}

function error(errors: string[]) {
  return { type: 'error', errors } as const;
}

async function* generateErrors(filePath: string) {
  yield fileTypeErrors(filePath);

  const markdown = await Markdown.load(filePath);

  yield headerErrors(filePath, markdown);
  yield subheaderErrors(markdown);
}

async function fileTypeErrors(filePath: string) {
  const exists = await fs.promises.exists(filePath);
  if (!exists) {
    return [`file does not exist: ${filePath}`];
  }

  const isFile = (await fs.promises.stat(filePath)).isFile();
  if (!isFile) {
    return [`path is not a file: ${filePath}`];
  }

  if (!filePath.endsWith('.spec.md')) {
    return [`file must have '.spec.md' extension, but got: '${filePath}'`];
  }

  return [];
}

function headerErrors(filePath: string, markdown: Markdown): string[] {
  const errors = [];

  const filename = path.basename(filePath).split('.').at(0);
  if (!filename) {
    errors.push('file must have a name, but got none');
  }

  const header = markdown.getHeader();
  if (header.length === 0) {
    errors.push('file must have a markdown header, but got none');
  }

  if (filename !== header) {
    errors.push(
      'filename and markdown header must match, but got: ' +
        `filename '${filename}' and markdown header '${header}'`,
    );
  }

  errors.push(...identifierErrors(header));

  return errors;
}

function subheaderErrors(markdown: Markdown): string[] {
  const errors = [];

  const header = markdown.getHeader();

  const subheaders = markdown.getSubheaders();
  if (subheaders.length === 0) {
    errors.push('file must have at least one markdown subheader, but got none');
  }

  const seen = new Set<string>();

  for (const subheader of subheaders) {
    if (seen.has(subheader)) {
      errors.push(`all subheaders must be unique, but got a duplicate: '${subheader}'`);
    }
    seen.add(subheader);

    if (subheader.startsWith(`${header}.`)) {
      errors.push(...identifierErrors(subheader.replace(`${header}.`, '')));
    } else {
      errors.push(`all subheaders must start with '${header}.', but got: '${subheader}'`);
    }
  }

  return errors;
}

function identifierErrors(id: string): string[] {
  const errors = [];

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    errors.push(
      `id must only contain alphanumeric characters, underscores, or hyphens, but got: '${id}'`,
    );
  }

  return errors;
}
