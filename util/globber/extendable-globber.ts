import type { Scope } from '~/specs/scope';
import { AutoExpandGlobber } from '~/util/globber/auto-expand-globber';
import { CachedGlobber } from '~/util/globber/cached-globber';
import { FsGlobber } from '~/util/globber/fs-globber';
import type { Globber } from '~/util/globber/globber';

export class ExtendableGlobber implements Globber {
  constructor(private globber: Globber) {}

  static fs(): ExtendableGlobber {
    return new ExtendableGlobber(new FsGlobber());
  }

  autoExpand(): ExtendableGlobber {
    return this.extend(new AutoExpandGlobber(this.globber));
  }

  cached(capacity: number = 10): ExtendableGlobber {
    return this.extend(new CachedGlobber(capacity, this.globber));
  }

  async glob(scope: Scope): Promise<string[]> {
    return this.globber.glob(scope);
  }

  private extend(globber: Globber): ExtendableGlobber {
    return new ExtendableGlobber(globber);
  }
}
