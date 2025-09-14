import fs from 'fs';
import { Scope } from '~/specs/scope';
import type { Globber } from '~/util/globber/globber';

export class AutoExpandGlobber implements Globber {
  constructor(private globber: Globber) {}

  async glob(scope: Scope): Promise<string[]> {
    const [includePatterns, excludePatterns] = await Promise.all([
      Promise.all(scope.getIncludePatterns().map(maybeExpandToRecursiveGlob)),
      Promise.all(scope.getExcludePatterns().map(maybeExpandToRecursiveGlob)),
    ]);

    const expandedScope = new Scope({
      includePatterns,
      excludePatterns,
    });

    return this.globber.glob(expandedScope);
  }
}

async function maybeExpandToRecursiveGlob(pattern: string): Promise<string> {
  try {
    const stats = await fs.promises.stat(pattern);
    if (stats.isDirectory()) {
      return `${pattern}/**/*`;
    }
  } catch {
    // Ignore errors, return the original pattern
  }
  return pattern;
}
