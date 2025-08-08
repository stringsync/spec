import { StringReader } from './string-reader';
import type { Readable, Reader } from './types';

function isReader(value: unknown): value is Reader {
  return typeof (value as Reader).read === 'function';
}

function toReader(readable: Readable): Reader {
  if (typeof readable === 'string') {
    return new StringReader(readable);
  } else if (isReader(readable)) {
    return readable;
  } else {
    throw new Error('Input must be a string or an instance of Reader');
  }
}

function read(readable: Readable): Promise<string> {
  return toReader(readable).read();
}

export const readers = {
  isReader,
  toReader,
  read,
};
