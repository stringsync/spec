import * as fs from 'fs';
import type { Scope } from '~/specs/scope';
import type { Globber } from '~/util/globber/globber';

export class FsGlobber implements Globber {
  async glob(scope: Scope): Promise<string[]> {
    const paths = new Array<string>();
    const include = scope.getIncludePatterns();
    const exclude = scope.getExcludePatterns();

    for await (const path of fs.promises.glob(include, { exclude })) {
      paths.push(path);
    }

    return paths;
  }
}
