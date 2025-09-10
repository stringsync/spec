import { z, ZodObject, type ZodRawShape } from 'zod';

// spec(prompts.core)
export class Prompt<T extends ZodRawShape> {
  private template: string;
  private schema: ZodObject<T>;

  constructor(template: string, shape: T = {} as T) {
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

  getArgs(): T {
    return this.schema.shape;
  }
}
