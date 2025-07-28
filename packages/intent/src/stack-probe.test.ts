import { describe, it, expect } from 'bun:test';
import { StackProbe } from './stack-probe';

describe('StackProbe', () => {
  it('should return the caller file and line for direct call', () => {
    const probe = new StackProbe();
    const caller = probe.getCaller();
    expect(caller).toContain('stack-probe.test.ts');
  });
});
