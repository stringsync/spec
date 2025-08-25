import { describe, it, expect } from 'bun:test';
import { Sdk } from './sdk';
import { Spec } from './spec';

describe('Sdk', () => {
  it('creates specs', () => {
    const sdk = Sdk.standard();

    const spec = sdk.spec('foo', { bar: 'baz' });

    expect(spec).toBeInstanceOf(Spec);
  });
});
