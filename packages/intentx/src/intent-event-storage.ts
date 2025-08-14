import type { IntentEvent } from '@stringsync/intent/src/types';

export interface IntentEventStorage {
  addEvents(events: IntentEvent[]): Promise<void>;
  getEvents(): Promise<IntentEvent[]>;
}
