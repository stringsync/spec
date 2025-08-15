import type { IntentEvent } from '@stringsync/intent/src/types';

export interface IntentStorage {
  addIntentEvents(intentEvents: IntentEvent[]): Promise<void>;
  getAllIntentEvents(): Promise<IntentEvent[]>;
}
