export interface HttpClient {
  request(input: string, init?: RequestInit): Promise<Response>;
}
