import { Imperative } from './imperative';
import { StringReader } from './reader/string-reader';
import { RequirementLevel, type Readable } from './types';
import type { Reader } from './reader/types';

/**
 * A static class that provides imperatives for expressing intent specifications.
 *
 * See https://datatracker.ietf.org/doc/html/rfc2119
 */
export class it {
  private constructor() {
    throw new Error('it is a static class and cannot be instantiated');
  }

  static MUST(readable: Readable) {
    return imperative(RequirementLevel.Must, readable);
  }

  static MUST_NOT(readable: Readable) {
    return imperative(RequirementLevel.MustNot, readable);
  }

  static SHOULD(readable: Readable) {
    return imperative(RequirementLevel.Should, readable);
  }

  static SHOULD_NOT(readable: Readable) {
    return imperative(RequirementLevel.ShouldNot, readable);
  }

  static MAY(readable: Readable) {
    return imperative(RequirementLevel.May, readable);
  }
}

function imperative(level: RequirementLevel, readable: Readable) {
  let reader: Reader;
  if (typeof readable === 'string') {
    reader = new StringReader(readable);
  } else if (typeof readable.read === 'function') {
    reader = readable;
  } else {
    throw new Error('Input must be a string or an instance of Reader');
  }
  return new Imperative(level, reader);
}
