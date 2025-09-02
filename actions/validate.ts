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
  const errors = [...namingErrors(input.path, markdown), ...specErrors(markdown)];

  if (errors.length > 0) {
    return error(stopwatch, errors);
  } else {
    return success(stopwatch);
  }
}

function success(stopwatch: Stopwatch) {
  return { type: 'success', ms: stopwatch.ms() } as const;
}

function error(stopwatch: Stopwatch, errors: string[]) {
  return { type: 'error', errors, ms: stopwatch.ms() } as const;
}

function namingErrors(filePath: string, markdown: Markdown): string[] {
  const errors = [];

  const ext = path.extname(filePath);
  if (ext !== '.md') {
    errors.push(`file must have .md extension, but got: '${ext}'`);
  }

  const filename = path.basename(filePath).split('.').at(0);
  if (!filename) {
    errors.push('file must have a name, but got none');
  }

  if (markdown.getHeader().length === 0) {
    errors.push('file must have a markdown header, but got none');
  }

  if (filename !== markdown.getHeader()) {
    errors.push(
      'filename and markdown header must match, but got: ' +
        `filename '${filename}' and markdown header '${markdown.getHeader()}'`,
    );
  }

  return errors;
}

function specErrors(markdown: Markdown): string[] {
  const errors = [];

  const subheaders = markdown.getSubheaders();
  if (subheaders.length === 0) {
    errors.push('file must have at least one markdown subheader, but got none');
  }

  for (const subheader of subheaders) {
    if (subheader.trim().length === 0) {
      errors.push(`all subheaders must not be empty, but got an empty subheader`);
    }
  }

  return errors;
}
