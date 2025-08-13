import type { IntentEvent, Transport } from './types';

export class NoopTransport implements Transport {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async send(event: IntentEvent) {
    // noop
  }
}
