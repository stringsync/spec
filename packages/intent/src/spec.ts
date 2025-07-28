import type { Reader } from '@stringsync/core/src/reader/types';
import type { Readable } from './types';
import { StringReader } from '@stringsync/core/src/reader/string-reader';

export type SpecInput = {
  [id: string]: Readable;
};

export type SpecMap = {
  [id: string]: Reader;
};

export class Spec<T extends SpecMap> {
  private constructor(private specMap: T) {}

  static of<I extends SpecInput>(input: I) {
    const specMap: SpecMap = {};

    for (const id in input) {
      const value = input[id];
      specMap[id] = typeof value === 'string' ? new StringReader(value) : value;
    }

    return new Spec<{ [K in keyof typeof specMap]: Reader }>(specMap);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  impl(id: keyof T) {
    return () => {};
  }

  ref(id: keyof T) {
    return () => {
      this.impl(id);
    };
  }

  read(id: keyof T): Promise<string> {
    const reader = this.specMap[id];
    if (!reader) {
      return Promise.reject(new Error(`No reader found for id: ${String(id)}`));
    }
    return reader.read();
  }

  ids() {
    return Object.keys(this.specMap) as (keyof T)[];
  }
}
