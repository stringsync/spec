import { describe, it, expect } from 'bun:test';
import { TestTransport } from './test-transport';
import type { IntentEvent } from '../types';

describe('TestTransport', () => {
  it('should store sent events', async () => {
    const transport = new TestTransport();

    const event1: IntentEvent = { type: 'impl', specId: 'foo', intentId: 'bar', callsite: 'baz' };
    const event2: IntentEvent = { type: 'todo', specId: 'foo', intentId: 'baz', callsite: 'qux' };

    await transport.send(event1);
    await transport.send(event2);

    expect(transport.getSentEvents()).toEqual([event1, event2]);
  });

  it('should return an empty array when no events sent', () => {
    const transport = new TestTransport();
    expect(transport.getSentEvents()).toBeEmpty();
  });
});
