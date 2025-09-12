import { Selector } from './selector';

// spec(spec.scope)
export class Scope {
  private selectors: Selector[];
  private patterns: string[];
  private ignoredPatterns: string[];

  constructor(
    selectors: Selector[],
    patterns: string[],
    ignoredPatterns: string[]
  ) {
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
}