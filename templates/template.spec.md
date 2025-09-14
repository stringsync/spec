# template

## template.txt

`TxtTemplate` is a lightweight version of the mustache template system.

In Bun, you can import .txt files like this so that they are part of the binary:

```ts
import fooTxt from '~/foo.txt' with { type: 'text' };
```

An example of how `TxtTemplate` is supposed to be used is this:

```ts
import fooTxt from '~/foo.txt' with { type: 'text' };

export const FOO_TXT_TEMPLATE = new TxtTemplate(fooTxt, {
  foo: z.string();
});
```

Then, you can render it anywhere:

```ts
program.command('foo').action(() => {
  const foo = FOO_TXT_TEMPLATE.render({ foo: 'foo' });
  console.log(foo);
});
```
