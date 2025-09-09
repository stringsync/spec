import type { Logger } from '~/util/logs/logger';

export class LevelPrefixLogger implements Logger {
  constructor(private log: Logger) {}

  info(message: unknown, ...optionalParams: unknown[]): void {
    this.log.info(`[INFO] ${message}`, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.log.error(`[ERROR] ${message}`, ...optionalParams);
  }
}
