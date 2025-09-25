import * as fs from 'fs';
import { glob } from 'glob';
import type { Scope } from '~/specs/scope';
import type { Globber } from '~/util/globber/globber';

export class FsGlobber implements Globber {
  async glob(scope: Scope): Promise<string[]> {
    const include = scope.getIncludePatterns();
    const exclude = scope.getExcludePatterns();
    const paths = await glob(include, { ignore: exclude });

    const isFiles = await Promise.all(paths.map(isFile));
    const filepaths: string[] = [];
    for (let i = 0; i < paths.length; i++) {
      if (isFiles[i]) {
        filepaths.push(paths[i]);
      }
    }

    return filepaths;
  }
}

async function isFile(path: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}
