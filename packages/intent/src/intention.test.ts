import { describe, it, expect } from 'bun:test';
import { Intention } from './intention';
import { RequirementLevel } from './types';
import { StringReader } from '@stringsync/core/src/reader/string-reader';

describe('Intention', () => {
  it('should create a human-readable intention string', async () => {
    const intention = new Intention(RequirementLevel.Must, new StringReader('do something'));
    const result = await intention.read();
    expect(result).toBe('it MUST do something');
  });
});
