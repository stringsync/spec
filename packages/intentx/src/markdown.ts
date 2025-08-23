import { Spec } from '@stringsync/intent/src/spec';
import * as path from 'path';

export async function markdown(input: { path: string; exportedVariableName: string }) {
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
    throw new Error(`Exported variable '${input.exportedVariableName}' must be a Spec object`);
  }

  console.log(await value.toMarkdown());
}
