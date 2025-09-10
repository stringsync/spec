# prompts

@stringsync/spec has prompts that can be dynamically generated. They're mainly used to standardized workflows, especially ones that involve tools. A workflow example is to implement a spec.

## prompts.dir

It SHOULD have a `prompts` directory, which SHOULD be flat.
It SHOULD contain a subdirectory called `data`, which will contain all the markdown files.

## prompts.core

Prompts are templates that can optionally accept arguments.

It MUST have a `Prompt` class, which contains a template and allows callers to create prompt strings, given that they provide all the arguments.
It MUST throw an error when all the arguments aren't provided.
It MUST use a raw zod shape as the input, defaulting to an empty object.

<example>

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({ name, version });

// Tools
server.tool(
  'spec.check',
  'validate a @stringsync/spec spec file',
  { path: z.string().describe('the absolute path to the spec file to validate') }, // raw zod shape
  checkTool,
);
```

</example>

A `Prompt` instance MUST expose what arguments it needs to make an interactive CLI prompt possible.
