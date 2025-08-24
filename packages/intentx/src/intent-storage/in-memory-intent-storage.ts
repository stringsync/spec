import type { IntentEvent } from '@stringsync/intent/src/types';
import type { IntentStorage } from './types';

export class InMemoryIntentStorage implements IntentStorage {
  private events = new Array<IntentEvent>();

  async addIntentEvents(events: IntentEvent[]): Promise<void> {
    this.events.push(...events);
  }

  async getAllIntentEvents(): Promise<IntentEvent[]> {
    return this.events;
  }
}
