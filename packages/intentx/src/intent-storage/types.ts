import type { IntentEvent } from '@stringsync/intent';

export interface IntentStorage {
  addIntentEvents(intentEvents: IntentEvent[]): Promise<void>;
  getAllIntentEvents(): Promise<IntentEvent[]>;
}
