export interface Command {
  run(): Promise<number>;
}
