import type { Reader } from '@stringsync/core/reader/types';
import { StringReader } from '@stringsync/core/reader/string-reader';
import { Intention, NegatableIntention } from './intention';
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

  static must(readable: Readable) {
    return intention(RequirementLevel.Must, readable);
  }

  static should(readable: Readable) {
    return intention(RequirementLevel.Should, readable);
  }

  static may(readable: Readable) {
    return intention(RequirementLevel.May, readable);
  }
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

  switch (level) {
    case RequirementLevel.Must:
      return new NegatableIntention(RequirementLevel.Must, reader);
    case RequirementLevel.MustNot:
      return new Intention(RequirementLevel.MustNot, reader);
    case RequirementLevel.Should:
      return new NegatableIntention(RequirementLevel.Should, reader);
    case RequirementLevel.ShouldNot:
      return new Intention(RequirementLevel.ShouldNot, reader);
    case RequirementLevel.May:
      return new Intention(RequirementLevel.May, reader);
    default:
      throw new Error(`Unknown requirement level: ${level}`);
  }
}
