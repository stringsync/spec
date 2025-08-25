import { MultiReader, readers, type Readable } from '@stringsync/core';
import { Intent } from './intent';
import { RequirementLevel } from './types';

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

  static multi(...readables: Readable[]) {
    return new MultiReader(readables.map(readers.toReader));
  }

  static raw(readable: Readable) {
    return readers.toReader(readable);
  }
}

function intent(level: RequirementLevel, readable: Readable) {
  const reader = readers.toReader(readable);
  return new Intent(level, reader);
}

function should(readable: Readable) {
  return intent(RequirementLevel.Should, readable);
}

should.not = function (readable: Readable) {
  return intent(RequirementLevel.ShouldNot, readable);
};

function must(readable: Readable) {
  return intent(RequirementLevel.Must, readable);
}

must.not = function (readable: Readable) {
  return intent(RequirementLevel.MustNot, readable);
};

function may(readable: Readable) {
  return intent(RequirementLevel.May, readable);
}
