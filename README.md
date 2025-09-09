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
bunx @stringsync/spec check calculator.spec.md
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

## MCP

_Coming soon_

@stringsync/spec will have an MCP server that provides:

- tools to check specs and scan for tags
- prompts to implement specs
- prompts to infer and tag specs from existing code

For now, instruct your agent to read https://raw.githubusercontent.com/stringsync/spec/refs/heads/master/AGENTS.md.

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
