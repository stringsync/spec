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
}
