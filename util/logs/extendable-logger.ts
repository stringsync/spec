import { ConsoleLogger } from '~/util/logs/console-logger';
import { IndentedLogger } from '~/util/logs/indented-logger';
import type { Logger } from '~/util/logs/logger';
import { SpacedLogger } from '~/util/logs/spaced-logger';

export class ExtendableLogger {
  constructor(private log: Logger) {}

  static console(): ExtendableLogger {
    return new ExtendableLogger(new ConsoleLogger());
  }

  get spaced(): ExtendableLogger {
    return this.extend(new SpacedLogger(this.log));
  }

  indented(depth = 1): ExtendableLogger {
    return this.extend(new IndentedLogger(this.log, depth));
  }

  info(message: unknown, ...optionalParams: unknown[]): void {
    this.log.info(message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.log.error(message, ...optionalParams);
  }

  private extend(log: Logger): ExtendableLogger {
    return new ExtendableLogger(log);
  }
}
