import { Scope } from './scope';

// spec(spec.tag)
export class Tag {
  private name: string;
  private specName: string;
  private moduleName: string;
  private content: string;
  private path: string;

  constructor(init: {
    name: string;
    specName: string;
    moduleName: string;
    content: string;
    path: string;
  }) {
    this.name = init.name;
    this.specName = init.specName;
    this.moduleName = init.moduleName;
    this.content = init.content;
    this.path = init.path;
  }

  getName(): string {
    return this.name;
  }

  getSpecName(): string {
    return this.specName;
  }

  getModuleName(): string {
    return this.moduleName;
  }

  getContent(): string {
    return this.content;
  }

  getPath(): string {
    return this.path;
  }

  getLocation(): string {
    return this.path;
  }
}
