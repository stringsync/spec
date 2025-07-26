# @stringsync/intent

Map intention to implementation

## Example (WIP)

First, declare a spec.

_spec.ts_

```ts
import { Spec, it, markdown } from '@stringsync/intent';

const examplesMd = markdown({
  path: 'path/to/examples.md',
});

export const spec = new Spec({
  foo: it
    .must('do foo')
    .example(examplesMd.subheading('foo-example-1'));
  bar: it
    .must.not('import bar')
    .example(examplesMd.subheading('bar-example-2'));
});
```

Next, reference the spec within the implementation and tests.

_foo.ts_

```ts
import { spec } from './spec.ts';

class Foo {
  @spec.impl('foo')
  foo() {}
}
```
