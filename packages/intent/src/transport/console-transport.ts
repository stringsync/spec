import type { IntentEvent } from '@stringsync/core/src/events/types';
import type { Transport } from './types';

export class ConsoleTransport implements Transport {
  async send(event: IntentEvent): Promise<void> {
    console.log(`${event.specId} | ${event.intentId} | ${event.callsite}`);
  }
}
