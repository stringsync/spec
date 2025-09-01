import { Spec } from '@stringsync/intent';
import * as path from 'path';

export async function md(input: { path: string; exportedVariableName?: string }): Promise<string> {
  const module = await import(path.resolve(process.cwd(), input.path));

  if (input.exportedVariableName) {
    return await getMarkdownForExportedVariable(module, input.exportedVariableName, input.path);
  } else {
    return await getMarkdownForAllSpecs(module, input.path);
  }

  function getMarkdownForExportedVariable(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    module: any,
    exportedVariableName: string,
    filePath: string,
  ): Promise<string> {
    const value = module[exportedVariableName];
    if (!value) {
      throw new Error(
        `variable '${exportedVariableName}' not exported in ${filePath}, ` +
          `found: ${Object.keys(module)
            .map((key) => `'${key}'`)
            .join(', ')}`,
      );
    }

    if (!(value instanceof Spec)) {
      throw new Error(
        `variable '${exportedVariableName}' must be a Spec, got: ${value.constructor.name}`,
      );
    }

    return value.toMarkdown();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function getMarkdownForAllSpecs(module: any, filePath: string): Promise<string> {
    const specKeys = Object.keys(module).filter((key) => module[key] instanceof Spec);
    if (specKeys.length === 0) {
      throw new Error(
        `No exported variables in ${filePath} are instances of Spec. Found: ${Object.keys(module)
          .map((key) => `'${key}'`)
          .join(', ')}`,
      );
    }
    const markdowns = await Promise.all(specKeys.map((key) => module[key].toMarkdown()));
    return markdowns.join('\n\n---\n\n');
  }
}
