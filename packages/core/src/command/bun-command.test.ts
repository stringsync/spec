import { describe, it, expect } from 'bun:test';
import { BunCommand } from './bun-command';

describe('BunCommand', () => {
  it('runs without crashing', () => {
    const command = new BunCommand({
      cmd: ['echo', 'hello', 'world'],
    });

    const promise = command.run();

    expect(promise).resolves.toBe(0);
  });
});
