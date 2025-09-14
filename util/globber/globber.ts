import type { Scope } from '~/specs/scope';

export interface Globber {
  glob(scope: Scope): Promise<string[]>;
}
