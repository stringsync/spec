import type { Logger } from '~/util/logs/logger';

export class StaticPrefixLogger implements Logger {
  constructor(
    private prefix: string,
    private log: Logger,
  ) {}

  info(message: unknown, ...optionalParams: unknown[]): void {
    this.log.info(`${this.prefix} ${message}`, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.log.error(`${this.prefix} ${message}`, ...optionalParams);
  }
}
