import { describe, it, expect } from 'bun:test';
import { assert } from './assert';

describe('assert.validId', () => {
  it('should not throw for valid ids', () => {
    expect(() => assert.validId('abc123')).not.toThrow();
    expect(() => assert.validId('abc_123')).not.toThrow();
    expect(() => assert.validId('abc-123')).not.toThrow();
    expect(() => assert.validId('abc.123')).not.toThrow();
    expect(() => assert.validId('ABC_def-123.456')).not.toThrow();
  });

  it('should throw for ids with spaces', () => {
    expect(() => assert.validId('abc 123')).toThrow();
  });

  it('should throw for ids with special characters', () => {
    expect(() => assert.validId('abc@123')).toThrow();
    expect(() => assert.validId('abc#123')).toThrow();
    expect(() => assert.validId('abc$123')).toThrow();
    expect(() => assert.validId('abc!123')).toThrow();
  });

  it('should throw for empty string', () => {
    expect(() => assert.validId('')).toThrow();
  });

  it('should throw for ids with slashes', () => {
    expect(() => assert.validId('abc/123')).toThrow();
    expect(() => assert.validId('abc\\123')).toThrow();
  });
});
