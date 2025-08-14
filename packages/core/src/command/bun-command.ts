import type { Command } from './types';

export type BunCommandInit = {
  cmd: string[];
  env?: Dict<string>;
};

export class BunCommand implements Command {
  constructor(private init: BunCommandInit) {}

  async run() {
    const subprocess = Bun.spawn({
      cmd: this.init.cmd,
      stdin: 'ignore',
      stdout: 'ignore',
      stderr: 'ignore',
      env: this.init.env,
    });

    return subprocess.exited;
  }
}
