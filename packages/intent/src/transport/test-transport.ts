import type { IntentEvent } from '../types';

export class TestTransport {
  private events: IntentEvent[] = [];

  async send(event: IntentEvent): Promise<void> {
    this.events.push(event);
  }

  getSentEvents(): IntentEvent[] {
    return this.events;
  }

  clear() {
    this.events = [];
  }
}
