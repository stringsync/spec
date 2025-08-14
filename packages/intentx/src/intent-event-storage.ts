import type { IntentEvent } from '@stringsync/intent/src/types';

export interface IntentEventStorage {
  addEvent(event: IntentEvent): Promise<void>;
  addEvents(events: IntentEvent[]): Promise<void>;
  getEvents(): Promise<IntentEvent[]>;
}
