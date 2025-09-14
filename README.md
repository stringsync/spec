# @stringsync/spec

spec driven development tools

## Getting Started

To run the commands, you will need an NPM package executor like `npx`. We recommend `bunx`: https://bun.sh/.

This README aliases `bunx @stringsync/spec` with `spec`. I recommend you add the same alias to your shell profile.

> [!CAUTION]
> Do not alias the command if you plan to do development on the @stringsync/spec repo itself. See the [Dev](#Dev) section.

**Declare**

_calculator.spec.md_

```md
# calculator

## calculator.add

It adds two numbers.
```

**Tag**

```ts
class Calculator {
  // spec(calculator.add): Optional tag body.
  add(a: number, b: number) {
    return a + b;
  }
}
```

**Scan**

```sh
spec scan
```

## Prompts

You can generate prompts for various workflows using the @stringsync/spec CLI. If you have the @stringsync/spec MCP server installed on your agent, you can access the same prompts through your MCP application (if it's supported).

To see an interactive list of available prompts, run:

```sh
spec prompt
```

You can also run a specific prompt:

```sh
spec prompt <name>
```

If the prompt has arguments, the CLI will ask you for them.

To provide arguments directly, use the `--arg` flag:

```sh
spec prompt <name> --arg key1=val1 --arg key2=val2
```

To pipe the output to another program, use the `--pipe` flag:

```sh
spec prompt <name> --pipe | pbcopy
```

## Recommended Workflows

You can combine the prompts in any order, but here are some recommendations.

### Create a Module

1. create foo.spec.md
2. spec prompt refine --arg selector=foo
3. spec prompt plan --arg selector=foo
4. spec prompt build --arg selector=foo

### Update a Spec

1. update foo.spec.md (or a tagged implementation)
2. spec prompt refine --arg selector=foo.bar
3. spec prompt sync --arg selector=foo.bar
4. spec prompt plan --arg selector=foo.bar
5. spec prompt build --arg selector=foo.bar

### Delete a Module

1. delete foo.spec.md
2. spec prompt sync --arg selector=foo

## MCP

To run the @stringsync/spec MCP server, run:

```sh
spec mcp
```

Read your agent's documentation to run the MCP server. For example, Cline's configuration will look like this:

```json
{
  "mcpServers": {
    "spec": {
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

To verify that `spec` is not installed, run:

```sh
spec
```

> command not found: spec

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

To uninstall the `spec` CLI, run:

```sh
bun teardown
```

### Releasing

Install the official GitHub CLI at https://github.com/cli/cli.

To bump the version and release it, run:

```sh
bun run release [alpha|beta|rc|patch|minor|major]
```
