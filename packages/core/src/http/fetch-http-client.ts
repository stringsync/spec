import type { HttpClient } from './types';

export class FetchHttpClient implements HttpClient {
  async request(input: string, init?: RequestInit): Promise<Response> {
    return fetch(input, init);
  }
}
