import type { IntentEvent } from '@stringsync/core/src/events/types';
import type { Transport } from './types';

export class HttpTransport implements Transport {
  constructor(private url: string) {}

  async send(event: IntentEvent): Promise<void> {
    await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  }
}
