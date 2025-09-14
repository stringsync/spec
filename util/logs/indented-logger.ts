import type { Logger } from '~/util/logs/logger';

export class IndentedLogger implements Logger {
  constructor(
    private logger: Logger,
    private depth: number,
  ) {}

  info(...args: unknown[]) {
    this.logger.info(this.indentation(), ...args);
  }

  error(...args: unknown[]) {
    this.logger.error(this.indentation(), ...args);
  }

  private indentation() {
    return '  '.repeat(this.depth);
  }
}
