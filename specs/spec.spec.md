# spec

## spec.scope

A scope represents the patterns and ignored patterns used to hydrate spec objects.

**Relations**

- A scope belongs to a module.
- A scope belongs to a spec.
- A scope belongs to a tag.

**Behavior**

The `Scope` class fulfills the following interface:

```ts
interface Scope {
  getPatterns(): string[];
  getIgnoredPatterns(): string[];
}
```

Absolute patterns are preferred, but relative patterns are acceptable.

## spec.module

A file ending in .spec.md is a module.

**Relations**

- A module has many specs.
- A module has one scope.

**Behavior**

The `Module` class _implicitly_ implements the interface:

```ts
interface Module {
  getName(): string;
  getScope(): Scope;
  getPath(): string;
  getSpecs(): Spec[];
  findSpec(name: string): Spec | null;
  getErrors(): string[];
  getContent(): string;
}
```

The `Module` class also has a static method named `load`, which _implicitly_ implements the type:

```ts
type ModuleLoader = (path: string) => Promise<Module>;
```

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
  getName(): string;
  getModuleName(): string;
  getLocation(): string;
  getTags(): Tag[];
  getContent(): string;
}
```

## spec.tag

A tag is an reference to a spec, usually in code.

**Relations**

- A tag belongs to a spec.
- A tag has one scope.

**Anatomy**

```ts
// foo(bar.baz): qux
```

- "foo" is the tag name
- "bar" is the module name
- "bar.baz" is the spec name
- "qux" is the tag content

**Behavior**

The `Tag` class _implicitly_ implements the interface:

```ts
interface Tag {
  getName(): string;
  getModuleName(): string;
  getSpecName(): string;
  getContent(): string;
}
```

## spec.validation

- The module name must only contain alphanumeric characters, hyphens, and underscores.
- The header must match the name.
- Each subheader must have the format `<module-name>.<spec.name>`
- Each subheader must only contain alphanumeric characters, hyphens, and underscores.
- Each subheader must be unique.
