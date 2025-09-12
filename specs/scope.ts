import { minimatch } from 'minimatch';
import { Module } from './module';
import { Selector } from './selector';
import { Spec } from './spec';
import { Tag } from './tag';

// spec(spec.scope)
export class Scope {
  private selectors: Selector[];
  private patterns: string[];
  private ignoredPatterns: string[];

  constructor(selectors: Selector[], patterns: string[], ignoredPatterns: string[]) {
    this.selectors = selectors;
    this.patterns = patterns;
    this.ignoredPatterns = ignoredPatterns;
  }

  getSelectors(): Selector[] {
    return this.selectors;
  }

  getPatterns(): string[] {
    return this.patterns;
  }

  getIgnoredPatterns(): string[] {
    return this.ignoredPatterns;
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
    if (this.patterns.length === 0) {
      return true;
    }
    return (
      this.patterns.some((pattern) => minimatch(path, pattern)) &&
      !this.ignoredPatterns.some((ignore) => minimatch(path, ignore))
    );
  }
}
