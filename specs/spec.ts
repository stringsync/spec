import { Scope } from './scope';
import { Tag } from './tag';

// spec(spec.spec)
export class Spec {
  private scope: Scope;
  private name: string;
  private moduleName: string;
  private path: string;
  private tags: Tag[];
  private content: string;

  constructor(init: {
    scope: Scope;
    name: string;
    moduleName: string;
    path: string;
    content: string;
    tags?: Tag[];
  }) {
    this.scope = init.scope;
    this.name = init.name;
    this.moduleName = init.moduleName;
    this.path = init.path;
    this.content = init.content;
    this.tags = init.tags ?? [];
  }

  getScope(): Scope {
    return this.scope;
  }

  getName(): string {
    return this.name;
  }

  getModuleName(): string {
    return this.moduleName;
  }

  getPath(): string {
    return this.path;
  }

  getLocation(): string {
    return this.path;
  }

  getTags(): Tag[] {
    return this.tags;
  }

  getContent(): string {
    return this.content;
  }

  withTags(tags: Tag[]): Spec {
    return new Spec({
      scope: this.scope,
      name: this.name,
      moduleName: this.moduleName,
      path: this.path,
      content: this.content,
      tags: tags,
    });
  }
}
