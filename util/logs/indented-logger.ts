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

  indent() {
    return new IndentedLogger(this.logger, this.depth + 1);
  }

  outdent() {
    return new IndentedLogger(this.logger, Math.max(0, this.depth - 1));
  }

  private indentation() {
    return '  '.repeat(this.depth);
  }
}
