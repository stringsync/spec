# @stringsync/spec

@stringsync/spec is an NPM library that allows you to declare a spec and reference it in code. It's a lightweight mechanism to create a requirements-to-code index.

## Commands

If the `@stringsync/spec` MCP server is installed, use the MCP tools it provides.

Alternatively, you can run commands with the @stringsync/spec CLI:

```sh
bunx @stringsync/spec
```

You can use `npx` instead of `bunx`.

When I reference a command in this document, assume the MCP tool equivalent or fallback to the CLI.

## Declaring a Spec

1. Create a file with the format: `<filename>.spec.md`.
2. Add a header with the format: `# <filename>`.
3. Add subheaders for each requirement with the format: `## <filename>.<id>`.
4. Validate the spec by running the `check` command. If it returns a failure, address the failure and try again.

<good-example>

_calculator.spec.md_

```md
# calculator

## calculator.add

It adds two numbers. For example, `calculator.add(2, 2) // returns 4`
```

</good-example>

## Referencing a Spec

1. Pick the spec file you want to reference. When multiple spec files have the same name, assume the _closest_ sibling or ancestor spec file is the spec being referenced. Alternatively, propose a different spec name or consolidate specs to avoid conflicts.
2. Pick the file you want to put the reference in.
3. Pick a place to put the comment. Ideally, the comment is right next to the implementation. The second best place is the top of the file, but this is not preferred. Try to limit the scope as much as possible.
4. Using the commenting rules of the file, add a comment with the format: `spec(<filename>.<id>)` or `spec(<filename>.<id>): Optional body.`.
5. Check that the spec is returned by running the `scan` command. If it still doesn't show, it's possible that the file type is not supported. Inform the user to create an issue at https://github.com/stringsync/spec.

<good-example>

This is a good example because the tag is colocated with the implementation.

```ts
class Calculator {
  subtract(a: number, b: number) {
    return a - b;
  }

  // spec(calculator.add)
  add(a: number, b: number) {
    return a + b;
  }
}
```

</good-example>

<bad-example>

This is a bad example because the tag is at the top of the file, when a more specific place is available.

```ts
// spec(calculator.add)

class Calculator {
  subtract(a: number, b: number) {
    return a - b;
  }

  add(a: number, b: number) {
    return a + b;
  }
}
```

</bad-example>
