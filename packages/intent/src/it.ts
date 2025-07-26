import { Imperative, type ImperativeInput } from './imperative';
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

  static MUST(input: ImperativeInput) {
    return this.imperative(RequirementLevel.Must, input);
  }

  static MUST_NOT(input: ImperativeInput) {
    return this.imperative(RequirementLevel.MustNot, input);
  }

  static SHOULD(input: ImperativeInput) {
    return this.imperative(RequirementLevel.Should, input);
  }

  static SHOULD_NOT(input: ImperativeInput) {
    return this.imperative(RequirementLevel.ShouldNot, input);
  }

  static MAY(input: ImperativeInput) {
    return this.imperative(RequirementLevel.May, input);
  }

  private static imperative(level: RequirementLevel, input: ImperativeInput) {
    return new Imperative(level, input);
  }
}
