# @stringsync/spec

spec driven development tools

## Getting Started

Install `bun` at https://bun.sh/.

> [!NOTE]  
> You can also use `npx`.

Declare a spec.

_calculator.spec.md_

```md
# calculator

## calculator.add

It adds two numbers.
```

Check the spec.

```
bunx @stringsync/spec check calculator.md
```

Reference the spec.

_calculator.ts_

```ts
class Calculator {
  // spec(calculator.add): Optional tag body.
  add(a: number, b: number) {
    return a + b;
  }
}
```

Scan for specs.

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

To run dev mode, run:

```sh
bun dev
```

To verify the installation, run:

```sh
spec
```

To uninstall the `specd` CLI, run:

```sh
bun teardown
```
