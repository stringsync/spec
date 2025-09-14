export class InternalError extends Error {
  static wrap(value: unknown): InternalError {
    if (value instanceof this) {
      return value;
    } else if (value instanceof Error) {
      return new this(value.message);
    } else if (typeof value === 'string') {
      return new this(value);
    } else {
      return new this('An unknown error occurred');
    }
  }

  // By default, errors are not public to reduce the risk of leaking sensitive information to an
  // client (LLM).
  public readonly isPublic: boolean = false;
}

export class PublicError extends InternalError {
  public readonly isPublic = true;
}

export class NotImplementedError extends InternalError {
  message = 'Not implemented';
}
