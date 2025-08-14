export interface IntentServer {
  start(port: number): Promise<void>;
  stop(): Promise<void>;
}
