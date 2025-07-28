import { describe, it, expect } from 'bun:test';
import { Intent } from './intent';
import { RequirementLevel } from './types';
import { StringReader } from '@stringsync/core/src/reader/string-reader';

describe('Intent', () => {
  it('should create a human-readable intention string', async () => {
    const intent = new Intent(RequirementLevel.Must, new StringReader('do something'));
    const result = await intent.read();
    expect(result).toBe('it MUST do something');
  });
});
