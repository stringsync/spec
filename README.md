# @stringsync/spec

Spec-Driven Development

## Getting Started

Install `bun` at https://bun.sh/.

> [!NOTE]  
> You can use `npx` instead of `bunx`.

Declare a spec.

_calculator.spec.md_

```md
# calculator

## add

It adds two numbers.
```

Validate the spec.

```
bunx @stringsync/spec validate calculator.spec.md
```

Reference the spec.

_calculator.ts_

```ts
class Calculator {
  // spec(calculator.add)
  add(a: number, b: number) {
    return a + b;
  }
}
```

Get spec callsites.

```sh
bunx @stringsync/spec scan
```

To see a complete list of commands, run:

```sh
bunx @stringsync/spec
```

## Dev

To install the project dependencies, run:

```sh
bun install
```

To install the `spec` CLI, run:

```sh
bun setup
```

To verify the installation, run:

```sh
spec
```

To uninstall the `spec` CLI, run:

```sh
bun teardown
```
