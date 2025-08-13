import { describe, it, expect } from 'bun:test';
import { NoopTransport } from './noop-transport';
import type { IntentEvent } from './types';

describe('NoopTransport', () => {
  it('should not throw', async () => {
    const noopTransport = new NoopTransport();
    const event: IntentEvent = {
      type: 'impl',
      specId: 'foo',
      intentId: 'bar',
      callsite: 'some/path/to/callsite',
    };

    expect(noopTransport.send(event)).resolves.toBeUndefined();
  });
});
