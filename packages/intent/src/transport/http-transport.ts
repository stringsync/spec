import type { Transport } from './types';
import { FetchHttpClient, type HttpClient } from '@stringsync/core';
import type { IntentEvent } from '../types';

export class HttpTransport implements Transport {
  constructor(
    private hostname: string,
    private httpClient: HttpClient,
  ) {}

  static localhost(port: number) {
    return new HttpTransport(`http://localhost:${port}`, new FetchHttpClient());
  }

  async send(event: IntentEvent): Promise<void> {
    await this.httpClient.request(`${this.hostname}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: [event] }),
    });
  }
}
