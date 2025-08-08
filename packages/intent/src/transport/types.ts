import type { IntentEvent } from '@stringsync/core/src/events/types';

export interface Transport {
  send(event: IntentEvent): Promise<void>;
}
