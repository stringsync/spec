import { z, ZodObject, type ZodRawShape } from 'zod';
import describeMd from '~/prompts/data/describe.txt' with { type: 'text' };

// spec(prompts.core)
export class Prompt<T extends ZodRawShape> {
  public readonly description: string;
  public readonly schema: ZodObject<T>;
  private template: string;

  private constructor(template: string, description: string, shape: T = {} as T) {
    this.template = template;
    this.description = description;
    this.schema = z.object(shape);
  }

  static Describe = new Prompt(describeMd, 'describes the project specs');

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
