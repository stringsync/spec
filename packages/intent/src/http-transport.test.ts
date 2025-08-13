import { describe, it, expect, beforeEach } from 'bun:test';
import { FakeHttpClient } from '@stringsync/core/src/http/fake-http-client';
import { HttpTransport } from './http-transport';
import type { IntentEvent } from './types';

describe('HttpTransport', () => {
  let fakeHttpClient: FakeHttpClient;

  beforeEach(() => {
    fakeHttpClient = new FakeHttpClient();
  });

  it('should send a request to the url', async () => {
    const httpTransport = new HttpTransport('http://localhost:4321/intent', fakeHttpClient);
    const event: IntentEvent = {
      type: 'impl',
      specId: 'foo',
      intentId: 'bar',
      callsite: 'some/path/to/callsite',
    };

    await httpTransport.send(event);

    const calls = fakeHttpClient.getCalls();
    expect(calls.length).toBe(1);
    expect(calls[0].input).toBe('http://localhost:4321/intent');
    expect(calls[0].init).not.toBeNull();
    expect(calls[0].init!.method).toBe('POST');
    expect(calls[0].init!.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(calls[0].init!.body).toBe(JSON.stringify(event));
  });
});
