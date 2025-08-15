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
      env: this.init.env,
    });

    return subprocess.exited;
  }
}
