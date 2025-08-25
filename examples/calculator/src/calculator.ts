import { spec } from './calculator.spec';

export class Calculator {
  @spec.impl('add')
  add(a: number, b: number): number {
    return a + b;
  }
}
