import { Imperative, NegatableImperative } from './imperative';
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

  static must(readable: Readable) {
    return imperative(RequirementLevel.Must, readable);
  }

  static should(readable: Readable) {
    return imperative(RequirementLevel.Should, readable);
  }

  static may(readable: Readable) {
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

  switch (level) {
    case RequirementLevel.Must:
      return new NegatableImperative(RequirementLevel.Must, reader);
    case RequirementLevel.MustNot:
      return new Imperative(RequirementLevel.MustNot, reader);
    case RequirementLevel.Should:
      return new NegatableImperative(RequirementLevel.Should, reader);
    case RequirementLevel.ShouldNot:
      return new Imperative(RequirementLevel.ShouldNot, reader);
    case RequirementLevel.May:
      return new Imperative(RequirementLevel.May, reader);
    default:
      throw new Error(`Unknown requirement level: ${level}`);
  }
}
