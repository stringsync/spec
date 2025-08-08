import type { Reader } from '@stringsync/core/src/reader/types';
import { type Readable } from './types';
import { StringReader } from '@stringsync/core/src/reader/string-reader';
import { NoopTracker } from './tracker/noop-tracker';
import { CallType } from './tracker/types';
import { StackProbe } from './stack-probe';

export type SpecInput = {
  [id: string]: Readable;
};

export type SpecMap = {
  [id: string]: Reader;
};

export class Spec<T extends SpecMap> {
  private constructor(private specs: T) {}

  static of<I extends SpecInput>(input: I) {
    const ids = Object.keys(input);

    const specs: SpecMap = {};
    for (const id of ids) {
      const value = input[id];
      specs[id] = typeof value === 'string' ? new StringReader(value) : value;
    }

    return new Spec<{ [K in keyof typeof specs]: Reader }>(specs);
  }

  impl(id: keyof T) {
    new NoopTracker().track(CallType.Impl, String(id), new StackProbe().getCallsite());
    return () => {};
  }

  todo(id: keyof T) {
    new NoopTracker().track(CallType.Todo, String(id), new StackProbe().getCallsite());
    return () => {};
  }

  ref(id: keyof T) {
    return new SpecRef(
      this.specs[id],
      () => {
        new NoopTracker().track(
          CallType.Impl,
          String(id),
          new StackProbe({ depth: 1 }).getCallsite(),
        );
      },
      () => {
        new NoopTracker().track(
          CallType.Todo,
          String(id),
          new StackProbe({ depth: 1 }).getCallsite(),
        );
      },
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
