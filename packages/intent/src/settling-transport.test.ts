import { describe, it, expect } from 'bun:test';
import type { Transport } from './types';
import { SettlingTransport } from './settling-transport';

describe('SettlingTransport', () => {
  it('tracks unsettled sends', async () => {
    const resolvers = Promise.withResolvers<void>();
    const fakeTransport = new FakeTransport(resolvers.promise);
    const settlingTransport = new SettlingTransport(fakeTransport);

    const sendPromise = settlingTransport.send({
      type: 'impl',
      specId: 'foo',
      intentId: 'bar',
      callsite: 'baz',
    });

    expect(settlingTransport.getUnsettledCount()).toBe(1);
    resolvers.resolve();
    await settlingTransport.settle();
    expect(settlingTransport.getUnsettledCount()).toBe(0);
    expect(sendPromise).resolves.toBeUndefined();
  });
});

class FakeTransport implements Transport {
  constructor(private promise: Promise<void>) {}

  send(): Promise<void> {
    return this.promise;
  }
}
