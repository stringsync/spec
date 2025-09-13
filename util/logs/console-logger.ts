import { IndentedLogger } from '~/util/logs/indented-logger';
import type { Logger } from '~/util/logs/logger';
import { SpacedLogger } from '~/util/logs/spaced-logger';

export class ConsoleLogger implements Logger {
  info(message: unknown, ...optionalParams: unknown[]): void {
    console.log(message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    console.error(message, ...optionalParams);
  }
}
