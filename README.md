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

## Prompts

You can generate prompts for various workflows using the @stringsync/spec CLI. If you have the @stringsync/spec MCP server installed on your agent, you can access the same prompts through there.

To see an interactive list of available prompts, run:

```sh
bunx @stringsync/spec prompt
```

You can also run a specific prompt:

```sh
bunx @stringsync/spec prompt <name>
```

If the prompt has arguments, the CLI will ask you for them.

To provide arguments directly, use the `--arg` flag:

```sh
bunx @stringsync/spec prompt <name> --arg key1=val1 --arg key2=val2
```

To pipe the output to another program, use the `--pipe` flag:

```sh
bunx @stringsync/spec prompt <name> --pipe | pbcopy
```

To help your agent understand @stringsync/spec, give it the following prompt:

```sh
bunx @stringsync/spec prompt agents --pipe | pbcopy
```

## MCP

To run the @stringsync/spec MCP server, the command is:

```sh
bunx @stringsync/spec mcp
```

Read your agent's documentation to run the MCP server. For example, Cline's configuration will look like this:

```json
{
  "mcpServers": {
    "@stringsync/spec": {
      "type": "stdio",
      "command": "bunx",
      "args": ["-y", "@stringsync/spec", "mcp"]
    }
  }
}
```

> [!NOTE]  
> The `-y` flag skips confirmation to download packages.

> [!NOTE]  
> Claude Desktop must use `npx`, since the paths aren't configurable.

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
