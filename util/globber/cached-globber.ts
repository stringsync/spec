import type { Scope } from '~/specs/scope';
import type { Globber } from '~/util/globber/globber';

export class CachedGlobber implements Globber {
  private cache = new Map<Scope, string[]>();

  constructor(
    private capacity: number,
    private globber: Globber,
  ) {}

  async glob(scope: Scope): Promise<string[]> {
    if (this.cache.has(scope)) {
      return this.cache.get(scope)!;
    }
    const paths = await this.globber.glob(scope);
    this.cache.set(scope, paths);

    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    return paths;
  }
}
