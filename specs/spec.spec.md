# spec

## spec.selector

A selector represents module and spec **name** selectors used to select modules and specs.

**Behavior**

The `Selector` class fulfills the following interface:

```ts
interface Selector {
  getModuleName(): string;
  getSpecName(): string | null;
  matches(target: Module | Spec | Tag): boolean;
}
```

The `Selector` class can be created multiple ways:

```ts
// selects the foo module and foo.bar spec
const s1 = Selector.parse('foo.bar');
const s2 = new Selector('foo', 'foo.bar');

// selects all specs in the foo module
const s3 = new Selector('foo');
const s4 = Selector.parse('foo');
const s5 = Selector.parse('foo.*'); // '*' parses to module-only selection

// parse multiple selectors
const sels = Selector.parseAll(['foo', 'bar.baz']);
```

Note: When using the constructor with two arguments, the second argument must be the full spec id "<module>.<spec>" (e.g., "foo.bar").

## spec.scope

A scope represents the included **path** patterns and ignored **path** patterns used for globs.

**Relations**

- Used by the globber to include/exclude files.
- A Module and each Spec carry a Scope.
- Tags do not have a Scope.

**Behavior**

The `Scope` class fulfills the following interface:

```ts
interface Scope {
  getIncludePatterns(): string[];
  getExcludePatterns(): string[];
}
```

Additional API:

```ts
// returns a scope that includes everything
static all(): Scope;
```

Matching is performed by Globber implementations using these patterns; Scope itself does not perform matches.

Absolute patterns are preferred, but relative patterns are acceptable.

**Hints**

- Use the glob library to determine if a path matches.

## spec.module

A file ending in .spec.md is a module.

**Relations**

- A module has many specs.
- A module has one scope.

**Behavior**

The `Module` class _implicitly_ implements the interface:

```ts
interface Module {
  getName(): string; // module header text
  getScope(): Scope;
  getPath(): string;
  getErrors(): string[];
  getMarkdown(): Markdown; // access to parsed markdown (content, subheaders, etc.)
  matches(target: { getModuleName(): string }): boolean;
}
```

The `Module` class also has a static method named `load`, which _implicitly_ implements the type:

```ts
type ModuleLoader = (path: string, scope: Scope) => Promise<Module>;
```

Validation occurs via getErrors(); no scope-vs-path validation is performed during construction.

**Hints**

- The `Module` class should be backed by the `Markdown` class from util/markdown.ts.

## spec.spec

A spec is a section within a module.

**Relations**

- A spec belongs to a module.
- A spec has many tags.
- A spec has one scope.

The `Spec` class _implicitly_ implements the interface:

```ts
interface Spec {
  getScope(): Scope;
  getName(): string; // full spec id: "<module>.<spec>"
  getModuleName(): string;
  getPath(): string;
  getLocation(): string;
  getContent(): string;
  matches(target: { getSpecName(): string }): boolean;
}
```

## spec.tag

A tag is a reference to a spec, usually in code.

**Relations**

- A tag references a spec.

**Anatomy**

```ts
// spec(bar.baz): qux
```

- "spec" is the tag name
- "bar" is the module name
- "bar.baz" is the spec name
- "qux" is the tag content

**Behavior**

The `Tag` class _implicitly_ implements the interface:

```ts
interface Tag {
  getSpecName(): string; // "<module>.<spec>"
  getModuleName(): string; // derived from specName
  getContent(): string; // optional, may span multiple lines
  getPath(): string; // file path where the tag was found
  getLocation(): string; // "path:line:column"
}
```

Note: The tag name currently used is "spec".

## spec.validation

- The module header is required and must only contain alphanumeric characters, hyphens, and underscores.
- Each subheader must have the format `<module-name>.<spec-name>`.
- The `<module-name>` prefix in each subheader must equal the module header.
- Each `<spec-name>` must only contain alphanumeric characters, hyphens, and underscores.
- Each subheader must be unique.
