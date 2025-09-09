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

_⚠️ Work in Progress_

To help your agent understand @stringsync/spec, instruct it to read https://raw.githubusercontent.com/stringsync/spec/refs/heads/master/AGENTS.md.

To run the @stringsync/spec MCP server, the command is:

```sh
bunx @stringsync/spec mcp
```

Read your agent's documentation to run the MCP server. For example, Claude's configuration will look like this:

```json
{
  "mcpServers": {
    "@stringsync/spec": {
      "command": "bunx",
      "args": ["-y", "@stringsync/spec", "mcp"]
    }
  }
}
```

> [!NOTE]  
> The `-y` flag skips confirmation to download packages.

To run the MCP inspector, run:

```sh
bunx @modelcontextprotocol/inspector bunx @stringsync/spec mcp
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

### Releasing

Install the official GitHub CLI at https://github.com/cli/cli.

To bump the version and release it, run:

```sh
bun run release [alpha|beta|rc|patch|minor|major]
```

> [!IMPORTANT]  
> Some partial failures are not reversible.
