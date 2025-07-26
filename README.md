# @stringsync/intent

Map intention to implementation

## Example (WIP)

Declare the spec.

_spec.ts_

```ts
export const spec = new Spec({
  foo: it.must('log the string "foo"').example('new Foo().foo(); // logs "foo"'),
});
```

Reference the spec.

_foo.ts_

```ts
class Foo {
  @spec.impl('foo')
  foo() {
    console.log('foo');
  }
}
```

Search for the spec.

```shell
bunx @stringsync/intentx coverage
[
  {
    "path": "full/path/to/spec.ts",
    "unimplemented": {
      "count": 0,
      "ids": [],
      "locations": {}
    },
    "implemented": {
      "count": 1,
      "ids": ["foo"],
      "locations": {
        "foo": ["full/path/to/foo.ts"]
      }
    }
  }
]
```
