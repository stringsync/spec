import type { Transport } from './types';

export class NoopTransport implements Transport {
  async send() {
    // noop
  }
}
