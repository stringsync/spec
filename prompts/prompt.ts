import { z, ZodObject, type ZodRawShape } from 'zod';
import describeMd from '~/prompts/data/describe.txt' with { type: 'text' };
import agentsMd from '~/prompts/data/agents.txt' with { type: 'text' };

// spec(prompts.core)
export class Prompt<T extends ZodRawShape> {
  public readonly name: string;
  public readonly description: string;
  public readonly schema: ZodObject<T>;
  private template: string;

  private constructor(name: string, description: string, template: string, shape: T = {} as T) {
    this.name = name;
    this.description = description;
    this.template = template;
    this.schema = z.object(shape);
  }

  static Agents = new Prompt('agents', 'instructs how to use the library', agentsMd);
  static Describe = new Prompt('describe', 'describe the project specs and tags', describeMd);

  static all = [this.Agents, this.Describe];

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
