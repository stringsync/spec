import type { Command } from './types';

export type BunCommandInit = {
  cmd: string[];
};

export class BunCommand implements Command {
  constructor(private init: BunCommandInit) {}

  async run() {
    const subprocess = Bun.spawn({
      cmd: this.init.cmd,
      stdin: 'ignore',
      stdout: 'ignore',
      stderr: 'ignore',
    });

    return subprocess.exited;
  }
}
