import { expect, describe, test } from 'bun:test';
import { spec } from './calculator.spec';
import { Calculator } from './calculator';

describe('Calculator', async () => {
  const add = await spec.read('add');

  test(add, () => {
    const calculator = new Calculator();
    const sum = calculator.add(2, 2);
    expect(sum).toBe(4);
  });
});
