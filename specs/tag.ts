// spec(spec.tag)
export class Tag {
  private specName: string;
  private moduleName: string;
  private content: string;
  private path: string;
  private location: string;

  constructor(init: {
    specName: string;
    moduleName: string;
    content: string;
    path: string;
    location: string;
  }) {
    this.specName = init.specName;
    this.moduleName = init.moduleName;
    this.content = init.content;
    this.path = init.path;
    this.location = init.location;
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
    return this.location;
  }
}
