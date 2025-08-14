import { describe, it, expect } from 'bun:test';
import { CallsiteLocator } from './callsite-locator';

describe('CallsiteLocator', () => {
  it('should return the caller file and line for direct call', () => {
    const probe = new CallsiteLocator();
    const caller = probe.locate();
    expect(caller).toContain('stack-probe.test.ts');
  });
});
