import type { IntentEvent } from '@stringsync/intent/src/types';
import type { IntentEventStorage } from './intent-event-storage';

export class InMemoryIntentEventStorage implements IntentEventStorage {
  private events = new Array<IntentEvent>();

  async addEvents(events: IntentEvent[]): Promise<void> {
    events.push(...events);
  }

  async getEvents(): Promise<IntentEvent[]> {
    return this.events;
  }
}
