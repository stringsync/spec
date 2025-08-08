import type { IntentEvent, Transport } from './types';
import type { HttpClient } from '@stringsync/core/src/http/types';
import { FetchHttpClient } from '@stringsync/core/src/http/fetch-http-client';

export class HttpTransport implements Transport {
  constructor(
    private url: string,
    private httpClient: HttpClient,
  ) {}

  static localhost(port: number) {
    return new HttpTransport(`http://localhost:${port}/intent`, new FetchHttpClient());
  }

  async send(event: IntentEvent): Promise<void> {
    await this.httpClient.request(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  }
}
