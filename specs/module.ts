import { Markdown } from '../util/markdown';
import { Scope } from './scope';

interface ModuleRelative {
  getModuleName(): string;
}

// spec(spec.module)
export class Module {
  constructor(
    private path: string,
    private markdown: Markdown,
    private scope: Scope,
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

  getMarkdown(): Markdown {
    return this.markdown;
  }

  getScope(): Scope {
    return this.scope;
  }

  // spec(spec.validation)
  getErrors(): string[] {
    const headerErrors = this.getHeaderErrors();
    if (headerErrors.length > 0) {
      return headerErrors;
    }

    const subheaderErrors = this.getSubheaderErrors();
    if (subheaderErrors.length > 0) {
      return subheaderErrors;
    }

    return [];
  }

  matches(target: ModuleRelative): boolean {
    return this.getName() === target.getModuleName();
  }

  private validateIdentifier(id: string): string[] {
    if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
      return [
        `Identifier must only contain alphanumeric characters, hyphens, and underscores, got: '${id}'`,
      ];
    }
    return [];
  }

  private getHeaderErrors(): string[] {
    const name = this.getName();
    if (!name) {
      return ['Module header is missing or empty.'];
    }
    return this.validateIdentifier(name);
  }

  private getSubheaderErrors(): string[] {
    const errors: string[] = [];
    const moduleName = this.getName();
    const subheaders = this.markdown.getSubheaders();
    const seenSubheaders = new Set<string>();

    for (const subheader of subheaders) {
      if (seenSubheaders.has(subheader)) {
        errors.push(`Duplicate subheader: ${subheader}`);
        continue;
      }
      seenSubheaders.add(subheader);

      const parts = subheader.split('.');
      if (parts.length !== 2) {
        errors.push(`Subheader must have the format <module-name>.<spec.name>, got: ${subheader}`);
        continue;
      }

      const [subModuleName, specName] = parts;

      errors.push(...this.validateIdentifier(subModuleName));
      errors.push(...this.validateIdentifier(specName));

      if (subModuleName !== moduleName) {
        errors.push(
          `Subheader module name "${subModuleName}" does not match module header name "${moduleName}"`,
        );
      }
    }
    return errors;
  }
}
