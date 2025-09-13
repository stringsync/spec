import { minimatch } from 'minimatch';
import { Module } from './module';
import { Selector } from './selector';
import { Spec } from './spec';
import { Tag } from './tag';

// spec(spec.scope)
export class Scope {
  private includePatterns: string[];
  private excludePatterns: string[];

  constructor(init: { includePatterns?: string[]; excludePatterns?: string[] }) {
    this.includePatterns = init.includePatterns ?? [];
    this.excludePatterns = init.excludePatterns ?? [];
  }

  static all(): Scope {
    return new Scope({ includePatterns: ['**/*'] });
  }

  getIncludePatterns(): string[] {
    return this.includePatterns;
  }

  getExcludePatterns(): string[] {
    return this.excludePatterns;
  }

  matches(target: Module | Spec | Tag): boolean {
    const path = target.getPath();

    const isIncluded =
      this.includePatterns.length === 0 ||
      this.includePatterns.some((pattern) => minimatch(path, pattern));

    const isExcluded = this.excludePatterns.some((ignore) => minimatch(path, ignore));

    return isIncluded && !isExcluded;
  }
}
