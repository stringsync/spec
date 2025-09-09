import type { Logger } from '~/util/logs/logger';

export class StderrLogger implements Logger {
  info(message: unknown, ...optionalParams: unknown[]): void {
    console.error(message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    console.error(message, ...optionalParams);
  }
}
