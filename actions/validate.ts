import { Stopwatch } from '~/util/stopwatch';
import fs from 'fs';
import path from 'path';
import { Markdown } from '~/util/markdown';

export type ValidateResult =
  | {
      type: 'success';
      ms: number;
    }
  | {
      type: 'error';
      errors: string[];
      ms: number;
    };

export async function validate(input: { path: string }): Promise<ValidateResult> {
  const stopwatch = Stopwatch.start();

  const exists = await fs.promises.exists(input.path);
  if (!exists) {
    return error(stopwatch, [`file does not exist: ${input.path}`]);
  }

  const isFile = (await fs.promises.stat(input.path)).isFile();
  if (!isFile) {
    return error(stopwatch, [`path is not a file: ${input.path}`]);
  }

  const markdown = await Markdown.fromPath(input.path);

  for (const errors of errorGroups(input.path, markdown)) {
    if (errors.length > 0) {
      return error(stopwatch, errors);
    }
  }

  return success(stopwatch);
}

function success(stopwatch: Stopwatch) {
  return { type: 'success', ms: stopwatch.ms() } as const;
}

function error(stopwatch: Stopwatch, errors: string[]) {
  return { type: 'error', errors, ms: stopwatch.ms() } as const;
}

function* errorGroups(path: string, markdown: Markdown) {
  yield fileNamingErrors(path, markdown);
  yield subheaderErrors(markdown);
}

function fileNamingErrors(filePath: string, markdown: Markdown): string[] {
  const errors = [];

  const ext = path.extname(filePath);
  if (ext !== '.md') {
    errors.push(`file must have .md extension, but got: '${ext}'`);
  }

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

  errors.push(...idErrors(header));

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

    if (!subheader.startsWith(`${header}.`)) {
      errors.push(`all subheaders must start with '${header}.', but got: '${subheader}'`);
    }

    errors.push(...idErrors(subheader.replace(`${header}.`, '')));
  }

  return errors;
}

function idErrors(id: string): string[] {
  const errors = [];

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    errors.push(
      `id must only contain alphanumeric characters, underscores, or hyphens, but got: '${id}'`,
    );
  }

  return errors;
}
