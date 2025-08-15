import { spec } from './calculator.spec';

export class Calculator {
  @spec.impl('add')
  add(a: number, b: number) {
    return a + b;
  }
}
