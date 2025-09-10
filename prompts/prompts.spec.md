# prompts

@stringsync/spec has prompts that can be dynamically generated. They're mainly used to standardized workflows, especially ones that involve tools. A workflow example is to implement a spec.

## prompts.dir

It SHOULD have a `prompts` directory, which SHOULD be mostly flat. The exception is a subdirectory called `data`, which will contain all the text files.

## prompts.core

Prompts are templates that can optionally accept arguments.

It MUST have a `Prompt` class in a file named `prompt.ts`, which contains a template and allows callers to create prompt strings, given that they provide all the arguments.
It MUST throw an error when all the arguments aren't provided.
It MUST use a raw zod shape as the input, defaulting to an empty object.
A `Prompt` instance MUST expose what arguments it needs to make an interactive CLI prompt possible.
The `Prompt` class must statically store all prompt instances as static members and privatize the constructor.
