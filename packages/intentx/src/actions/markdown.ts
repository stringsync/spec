import { Spec } from '@stringsync/intent';
import * as path from 'path';

export async function markdown(input: {
  path: string;
  exportedVariableName: string;
}): Promise<string> {
  const module = await import(path.resolve(process.cwd(), input.path));

  const value = module[input.exportedVariableName];
  if (!value) {
    throw new Error(
      `variable '${input.exportedVariableName}' not exported in ${input.path}, ` +
        `found: ${Object.keys(module)
          .map((key) => `'${key}'`)
          .join(', ')}`,
    );
  }

  if (!(value instanceof Spec)) {
    throw new Error(
      `variable '${input.exportedVariableName}' must be a Spec, got: ${value.constructor.name}`,
    );
  }

  return await value.toMarkdown();
}
