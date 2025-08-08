# @stringsync/intent

Map intention to implementation

## Getting Started

Install the library.

```shell
bun add @stringsync/intent
```

Configure the SDK.

_intent.config.ts_

```ts
import { Sdk, HttpTransport } from '@stringsync/intent';

export const sdk = new Sdk({
  transport: HttpTransport.localhost(3000),
});
```

Declare the spec.

_calculator.spec.ts_

```ts
export const spec = sdk.spec('calculator', {
  add: it.must('add two numbers').example('calculator.add(2, 2) // returns 4'),
});
```

Reference the spec.

_calculator.ts_

```ts
import { spec } from './calculator.spec';

class Calculator {
  @spec.impl('add')
  add(a: number, b: number) {
    return a + b;
  }
}
```

Test the spec.

_calculator.test.ts_

```ts
describe('Calculator', () => {
  it('adds two numbers', () => {
    const calculator = new Calculator();
    expect(calculator.add(2, 2)).toBe(4);
  });
});
```

View intent events.

```shell
bunx @stringsync/intentx coverage -- bun test calculator.test.ts
[
  {
    type: 'impl',
    specId: 'calculator',
    intentId: 'add',
    callsite: '/path/to/calculator.ts:4:2'
  }
]
```
