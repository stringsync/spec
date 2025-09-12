import { minimatch } from 'minimatch';
import { Module } from './module';
import { Selector } from './selector';
import { Spec } from './spec';
import { Tag } from './tag';

// spec(spec.scope)
export class Scope {
  private selectors: Selector[];
  private includedPatterns: string[];
  private excludedPatterns: string[];

  constructor(selectors: Selector[], includedPatterns: string[], excludedPatterns: string[]) {
    this.selectors = selectors;
    this.includedPatterns = includedPatterns;
    this.excludedPatterns = excludedPatterns;
  }

  getSelectors(): Selector[] {
    return this.selectors;
  }

  getIncludedPatterns(): string[] {
    return this.includedPatterns;
  }

  getExcludedPatterns(): string[] {
    return this.excludedPatterns;
  }

  matches(target: Module | Spec | Tag): boolean {
    return this.matchesSelector(target) && this.matchesPath(target.getPath());
  }

  private matchesSelector(target: Module | Spec | Tag): boolean {
    if (this.selectors.length === 0) {
      return true;
    }
    return this.selectors.some((selector) => selector.matches(target));
  }

  private matchesPath(path: string): boolean {
    const isIncluded =
      this.includedPatterns.length === 0 ||
      this.includedPatterns.some((pattern) => minimatch(path, pattern));

    const isExcluded = this.excludedPatterns.some((ignore) => minimatch(path, ignore));

    return isIncluded && !isExcluded;
  }
}
