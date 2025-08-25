import type { IntentEvent } from '../types';

export interface Transport {
  send(event: IntentEvent): Promise<void>;
}
