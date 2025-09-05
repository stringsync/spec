# @stringsync/spec

spec driven development tools

## Getting Started

Install `bun` at https://bun.sh/.

Declare a spec.

_calculator.spec.md_

```md
# calculator

## calculator.add

It adds two numbers.
```

Validate the spec.

```
bunx @stringsync/spec validate calculator.md
```

Reference the spec.

_calculator.ts_

```ts
class Calculator {
  // spec(calculator.add): Optional annotation.
  add(a: number, b: number) {
    return a + b;
  }
}
```

Scan for specs..

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

To install the `specd` CLI, run:

```sh
bun setup
```

To verify the installation, run:

```sh
specd
```

> [!NOTE]  
> `specd` doesn't require you to rebuild between changes.

To uninstall the `specd` CLI, run:

```sh
bun teardown
```
