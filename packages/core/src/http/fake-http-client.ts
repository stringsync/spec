import type { HttpClient } from './types';

export type HttpClientCall = {
  input: string;
  init?: RequestInit;
};

export class FakeHttpClient implements HttpClient {
  private calls = new Array<HttpClientCall>();

  async request(input: string, init?: RequestInit): Promise<Response> {
    this.calls.push({ input, init });
    return new Response(`Fake response for GET ${input}`);
  }

  getCalls(): HttpClientCall[] {
    return this.calls;
  }
}
