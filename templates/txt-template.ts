import z, { ZodObject, type ZodRawShape } from 'zod';

// spec(template.txt)
export class TxtTemplate<T extends ZodRawShape> {
  public readonly schema: ZodObject<T>;
  private template: string;

  private constructor(template: string, shape: T = {} as T) {
    this.template = template;
    this.schema = z.object(shape);
  }

  render(args: z.infer<typeof this.schema>): string {
    this.schema.parse(args);

    let prompt = this.template;
    for (const key of Object.keys(this.schema.shape)) {
      const value = args[key as keyof typeof args];
      prompt = prompt.replace(new RegExp(`\{{${key}}\}`, 'g'), String(value));
    }
    return prompt;
  }
}
