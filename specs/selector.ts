import { Module } from './module';
import { Spec } from './spec';
import { Tag } from './tag';

// spec(spec.selector)
export class Selector {
  private moduleName: string;
  private specName: string | null;

  constructor(moduleName: string, specName: string | null = null) {
    this.moduleName = moduleName;
    this.specName = specName;
  }

  static parse(selector: string): Selector {
    const parts = selector.split('.');
    if (parts.length === 1) {
      return new Selector(parts[0]);
    }
    if (parts.length === 2) {
      if (parts[1] === '*') {
        return new Selector(parts[0]);
      }
      return new Selector(parts[0], selector);
    }
    throw new Error(`Invalid selector format: ${selector}`);
  }

  getModuleName(): string {
    return this.moduleName;
  }

  getSpecName(): string | null {
    return this.specName;
  }

  matches(target: Module | Spec | Tag): boolean {
    if (target instanceof Module) {
      return this.moduleName === target.getName();
    }
    if (target instanceof Spec) {
      if (this.specName) {
        return this.moduleName === target.getModuleName() && this.specName === target.getName();
      }
      return this.moduleName === target.getModuleName();
    }
    if (target instanceof Tag) {
      if (this.specName) {
        return this.moduleName === target.getModuleName() && this.specName === target.getSpecName();
      }
      return this.moduleName === target.getModuleName();
    }
    return false;
  }
}
