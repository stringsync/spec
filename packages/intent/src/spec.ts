import type { Reader } from '@stringsync/core/src/reader/types';
import type { Readable } from './types';
import { StringReader } from '@stringsync/core/src/reader/string-reader';
import { StackProbe } from './stack-probe';

export type SpecInput = {
  [id: string]: Readable;
};

export type SpecMap = {
  [id: string]: Reader;
};

export type CallsiteMap<T extends SpecMap> = {
  impl: { [K in keyof T]: string[] };
  todo: { [K in keyof T]: string[] };
};

export class Spec<T extends SpecMap> {
  private constructor(
    private specs: T,
    private callsites: CallsiteMap<T>,
  ) {}

  static of<I extends SpecInput>(input: I) {
    const ids = Object.keys(input);

    const specs: SpecMap = {};
    for (const id of ids) {
      const value = input[id];
      specs[id] = typeof value === 'string' ? new StringReader(value) : value;
    }

    const callsites: CallsiteMap<SpecMap> = { impl: {}, todo: {} };
    for (const id of ids) {
      callsites.impl[id] = [];
      callsites.todo[id] = [];
    }

    return new Spec<{ [K in keyof typeof specs]: Reader }>(specs, callsites);
  }

  impl(id: keyof T) {
    this.trackImpl(id, new StackProbe({ depth: 2 }));
    return () => {};
  }

  todo(id: keyof T) {
    this.trackTodo(id, new StackProbe({ depth: 2 }));
    return () => {};
  }

  ref(id: keyof T) {
    return new SpecRef(
      this.specs[id],
      () => this.trackImpl(id, new StackProbe()),
      () => this.trackTodo(id, new StackProbe()),
    );
  }

  read(id: keyof T): Promise<string> {
    const reader = this.specs[id];
    if (!reader) {
      return Promise.reject(new Error(`No reader found for id: ${String(id)}`));
    }
    return reader.read();
  }

  getIds() {
    return Object.keys(this.specs) as (keyof T)[];
  }

  getCallsites() {
    return this.callsites;
  }

  private trackImpl(id: keyof T, stackProbe: StackProbe) {
    const caller = stackProbe.getCaller();
    if (!this.callsites.impl[id].includes(caller)) {
      this.callsites.impl[id].push(caller);
    }
  }

  private trackTodo(id: keyof T, stackProbe: StackProbe) {
    const caller = stackProbe.getCaller();
    if (!this.callsites.todo[id].includes(caller)) {
      this.callsites.todo[id].push(caller);
    }
  }
}

class SpecRef {
  constructor(
    private reader: Reader,
    private onImpl: () => void,
    private onTodo: () => void,
  ) {}

  todo() {
    this.onTodo();
    return () => {};
  }

  impl() {
    this.onImpl();
    return () => {};
  }

  read() {
    return this.reader.read();
  }
}
