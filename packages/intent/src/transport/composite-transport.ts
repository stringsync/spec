import type { IntentEvent } from '@stringsync/core/src/events/types';
import type { Transport } from './types';

export class CompositeTransport implements Transport {
  constructor(private transports: Transport[]) {}

  async send(event: IntentEvent): Promise<void> {
    await Promise.all(this.transports.map((transport) => transport.send(event)));
  }
}
