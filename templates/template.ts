import z from 'zod';

// spec(template.core)
export class Template<T extends z.ZodRawShape = any> {
  public readonly name: string;
  public readonly description: string;
  public readonly schema: z.ZodObject<T>;
  private renderer: (args: z.infer<z.ZodObject<T>>) => string;

  private constructor(
    name: string,
    description: string,
    shape: T,
    renderer: (args: z.infer<z.ZodObject<T>>) => string,
  ) {
    this.name = name;
    this.description = description;
    this.schema = z.object(shape);
    this.renderer = renderer;
  }

  static static(options: { name: string; description: string; text: string }): Template<{}> {
    return new Template(options.name, options.description, {}, () => options.text);
  }

  static dynamic<T extends z.ZodRawShape>(options: {
    name: string;
    description: string;
    shape: T;
    render: (args: z.infer<z.ZodObject<T>>) => string;
  }): Template<T> {
    return new Template(options.name, options.description, options.shape, options.render);
  }

  static unimplemented(options: { name: string; description: string }) {
    return Template.static({
      name: options.name,
      description: options.description,
      text: `The "${options.name}" template is not yet implemented.`,
    });
  }

  static replace(template: string, args: Record<string, any>): string {
    let result = template;

    for (const [key, value] of Object.entries(args)) {
      result = result.replace(new RegExp(`\{{${key}}\}`, 'g'), String(value));
    }

    return result;
  }

  render(args: z.infer<typeof this.schema>): string {
    return this.renderer(args);
  }
}
