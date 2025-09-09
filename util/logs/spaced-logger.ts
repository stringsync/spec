import type { Logger } from '~/util/logs/logger';

export class SpacedLogger implements Logger {
  constructor(private log: Logger) {}

  info(...messages: unknown[]) {
    this.log.info(this.spaced(...messages));
  }

  error(...messages: unknown[]) {
    this.log.error(this.spaced(...messages));
  }

  private spaced(...messages: unknown[]) {
    return messages.filter(Boolean).join(' ');
  }
}
