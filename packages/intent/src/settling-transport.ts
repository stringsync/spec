import type { IntentEvent, Transport } from './types';

export class SettlingTransport implements Transport {
  private sends = new Set<Promise<void>>();

  constructor(private transport: Transport) {}

  send(event: IntentEvent): Promise<void> {
    const send = this.transport.send(event);

    const promise = send.finally(() => {
      this.sends.delete(promise);
    });
    this.sends.add(promise);

    return send;
  }

  async settle() {
    await Promise.allSettled(this.sends);
  }

  getUnsettledCount() {
    return this.sends.size;
  }
}
