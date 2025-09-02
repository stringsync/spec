## Prompt 1: cujs.createEvent

I want you to implement the createEvent CUJ from @/examples/whencanyoumeetme/cujs.spec.ts.

You have the following commands that you can run in a shell:

<commands>

Read the CUJs as a markdown file.

```sh
intentx md examples/whencanyoumeetme/cujs.spec.ts
```

Detect intent events.

```sh
intentx scan examples/whencanyoumeetme/tsconfig.json
```

</commands>

Only make changes in @/examples/whencanyoumeetme.

--

## Prompt 2: data.portability

Implement the data.portability spec from @/examples/whencanyoumeetme/data.spec.ts

<commands>

Read the spec as a markdown file.

```sh
intentx md examples/whencanyoumeetme/[file].spec.ts
```

Detect intent events.

```sh
intentx scan examples/whencanyoumeetme/tsconfig.json
```

</commands>

After implementation:

1. Read @/examples/whencanyoumeetme/data.spec.ts and @/examples/whencanyoumeetme/cujs.spec.ts and
   annotate any `spec.(todo|impl)('intent', { note: 'need to do bar' })` throughout the codebase. A
   callsite note is preferred, but not required. When providing a note, add details that's useful
   for an entity (human or AI agent) reading the output of `intentx scan`.
2. Ensure you can detect intent events with `intentx scan`.
