import { Markdown } from '../util/markdown';
import { Scope } from './scope';
import { Spec } from './spec';
import { Selector } from './selector';

// spec(spec.module)
export class Module {
  private constructor(
    private path: string,
    private markdown: Markdown,
    private scope: Scope,
    private specs: Spec[] = [],
  ) {}

  static async load(path: string, scope: Scope): Promise<Module> {
    const markdown = await Markdown.load(path);
    return new Module(path, markdown, scope);
  }

  getPath(): string {
    return this.path;
  }

  getName(): string {
    return this.markdown.getHeader();
  }

  getContent(): string {
    return this.markdown.getContent();
  }

  getSpecs(): Spec[] {
    return this.specs;
  }

  withSpecs(specs: Spec[]): Module {
    return new Module(this.path, this.markdown, this.scope, specs);
  }

  findSpec(name: string): Spec | null {
    return this.specs.find((spec) => spec.getName() === name) ?? null;
  }

  getScope(): Scope {
    return this.scope;
  }

  // spec(spec.validation): TODO
  getErrors(): string[] {
    return [];
  }
}
