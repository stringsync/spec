# prompts

@stringsync/spec has prompts that can be dynamically generated. They're mainly used to standardized workflows, especially ones that involve tools. A workflow example is to implement a spec.

## prompts.core

Prompts are templates that can optionally accept arguments.

It must have a `Prompt` class in a file named `prompt.ts`, which contains a template and allows callers to create prompt strings, given that they provide all the arguments.
It must throw an error when all the arguments aren't provided.
It must use a raw zod shape as the input, defaulting to an empty object.
A `Prompt` instance must expose what arguments it needs to make an interactive CLI prompt possible.
The `Prompt` class must statically store all prompt instances as static members and privatize the constructor.

## prompts.cli

The CLI is partially interactive. When applicable, the user can be presented with options or forms they can fill out or choose with the arrow keys. For prompts, this is to progressively get all the data needed to render a prompt.

The prompt command can be called several ways:

- `spec prompt`: The CLI transitions to interactive mode and presents the user with names from `Prompt.all`.
- `spec prompt [name]`: If the prompt has a non-empty schema, the CLI transitions to interactive mode to help the user fill it out. Otherwise, the CLI renders the prompt.
- `spec prompt [name] --arg key1=val1 --arg key2=val2`: If the args have an unknown key, the CLI errors out. If the args have all the key-value pairs needed to render the prompt, it does it. If the args don't have all the key-value pairs, the CLI transitions to interactive mode to help the user fill out the missing args.

Each command must be able to be optionally piped to another program like `pbcopy`. A command option can toggle this behavior.
