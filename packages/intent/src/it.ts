import type { Reader } from '@stringsync/core/src/reader/types';
import { StringReader } from '@stringsync/core/src/reader/string-reader';
import { Intention } from './intention';
import { RequirementLevel, type Readable } from './types';

/**
 * A static class that provides imperatives for expressing intent specifications.
 *
 * See https://datatracker.ietf.org/doc/html/rfc2119
 */
export class it {
  private constructor() {
    throw new Error('it is a static class and cannot be instantiated');
  }

  static must = must;

  static should = should;

  static may = may;
}

function intention(level: RequirementLevel, readable: Readable) {
  let reader: Reader;
  if (typeof readable === 'string') {
    reader = new StringReader(readable);
  } else if (typeof readable.read === 'function') {
    reader = readable;
  } else {
    throw new Error('Input must be a string or an instance of Reader');
  }
  return new Intention(level, reader);
}

function should(readable: Readable) {
  return intention(RequirementLevel.Should, readable);
}

should.not = function (readable: Readable) {
  return intention(RequirementLevel.ShouldNot, readable);
};

function must(readable: Readable) {
  return intention(RequirementLevel.Must, readable);
}

must.not = function (readable: Readable) {
  return intention(RequirementLevel.MustNot, readable);
};

function may(readable: Readable) {
  return intention(RequirementLevel.May, readable);
}
