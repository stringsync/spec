import { describe, test, expect } from 'bun:test';
import { Calculator } from './calculator';
import { spec } from './calculator.spec';

describe('Calculator', async () => {
  const add = await spec.read('add');

  test(add, () => {
    const calculator = new Calculator();
    expect(calculator.add(2, 2)).toBe(4);
  });
});
