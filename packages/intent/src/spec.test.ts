import { beforeEach, describe, expect, it } from 'bun:test';
import { Sdk } from './sdk';

describe('Spec', () => {
  let sdk: Sdk;

  beforeEach(() => {
    sdk = new Sdk();
  });

  it('returns the spec id', () => {
    const spec = sdk.spec('foo', { bar: 'baz' });
    expect(spec.getSpecId()).toBe('foo');
  });

  it('returns the intent ids', () => {
    const spec = sdk.spec('foo', { bar: 'baz' });
    expect(spec.getIntentIds()).toEqual(['bar']);
  });
});
