import { describe, test, expect, afterAll } from 'bun:test';
import { Calculator } from './calculator';
import { spec } from './calculator.spec';
import { sdk } from './intent.config';

describe('Calculator', async () => {
  afterAll(async () => {
    await sdk.settle();
  });

  const add = await spec.read('add');

  test(add, () => {
    const calculator = new Calculator();
    expect(calculator.add(2, 2)).toBe(4);
  });
});
