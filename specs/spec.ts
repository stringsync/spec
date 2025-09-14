import { Scope } from './scope';

interface SpecRelative {
  getSpecName(): string;
}

// spec(spec.spec)
export class Spec {
  private scope: Scope;
  private name: string;
  private moduleName: string;
  private path: string;
  private content: string;
  private location: string;

  constructor(init: {
    scope: Scope;
    name: string;
    moduleName: string;
    path: string;
    content: string;
    location: string;
  }) {
    this.scope = init.scope;
    this.name = init.name;
    this.moduleName = init.moduleName;
    this.path = init.path;
    this.content = init.content;
    this.location = init.location;
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
    return this.location;
  }

  getContent(): string {
    return this.content;
  }

  matches(target: SpecRelative): boolean {
    return this.getName() === target.getSpecName();
  }
}
