import { z, ZodObject, type ZodRawShape } from 'zod';
import describeTxt from '~/prompts/data/describe.txt' with { type: 'text' };
import agentsTxt from '~/prompts/data/agents.txt' with { type: 'text' };

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

  static Agents = new Prompt(
    'agents',
    'instructs the assistant how to use @stringsync/spec',
    agentsTxt,
  );
  static Describe = new Prompt(
    'describe',
    'instruct the assistant to describe the project using @stringsync/spec',
    describeTxt,
  );

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
