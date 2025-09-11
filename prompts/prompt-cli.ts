import { Prompt } from '~/prompts/prompt';
import { type ZodRawShape } from 'zod';
import { select, input } from '@inquirer/prompts';
import type { Logger } from '~/util/logs/logger';

export class PromptCLI {
  constructor(private log: Logger) {}

  async run(name: string | undefined, args: Record<string, string>, pipe: boolean) {
    if (pipe) {
      // Non-interactive mode for piping
      const prompt = this.getPromptOrThrow(name);
      const allArgs = this.getArgsOrThrow(prompt, args);
      const parsedArgs = prompt.schema.parse(allArgs);
      this.log.info(prompt.render(parsedArgs));
      return;
    }

    // Interactive mode
    await this.runInteractive(name, args);
  }

  private async runInteractive(name?: string, existingArgs: Record<string, string> = {}) {
    const prompt = await this.getPromptInteractive(name);
    const allArgs = await this.getMissingArgsInteractive(prompt, existingArgs);
    const parsedArgs = prompt.schema.parse(allArgs);
    this.log.info(prompt.render(parsedArgs));
  }

  private getPromptOrThrow(name?: string): Prompt<any> {
    if (!name) {
      throw new Error('Prompt name is required in non-interactive mode.');
    }
    const prompt = Prompt.all.find((p) => p.name === name);
    if (!prompt) {
      throw new Error(`Prompt not found: ${name}`);
    }
    return prompt;
  }

  private async getPromptInteractive(name?: string): Promise<Prompt<any>> {
    if (name) {
      return this.getPromptOrThrow(name);
    }

    const selectedName = await select({
      message: 'Select a prompt',
      choices: Prompt.all.map((p) => ({
        name: p.name,
        value: p.name,
        description: p.description,
      })),
    });

    return this.getPromptOrThrow(selectedName);
  }

  private getArgsOrThrow(
    prompt: Prompt<any>,
    args: Record<string, string>,
  ): Record<string, string> {
    const schema = prompt.schema;
    const shape = schema.shape as ZodRawShape;
    const requiredKeys = Object.keys(shape);

    for (const key of Object.keys(args)) {
      if (!requiredKeys.includes(key)) {
        throw new Error(`Unknown argument: ${key}`);
      }
    }

    const missingKeys = requiredKeys.filter((key) => !args[key]);
    if (missingKeys.length > 0) {
      throw new Error(`Missing arguments for prompt "${prompt.name}": ${missingKeys.join(', ')}`);
    }

    return args;
  }

  private async getMissingArgsInteractive(
    prompt: Prompt<any>,
    existingArgs: Record<string, string>,
  ): Promise<Record<string, string>> {
    const allArgs = { ...existingArgs };
    const schema = prompt.schema;
    const shape = schema.shape as ZodRawShape;
    const requiredKeys = Object.keys(shape);

    const missingKeys = requiredKeys.filter((key) => !allArgs[key]);

    if (missingKeys.length > 0) {
      this.log.info(`Prompt: ${prompt.name}`);
      if (prompt.description) {
        this.log.info(prompt.description);
      }
    }

    for (const key of missingKeys) {
      const value = await input({ message: `Enter value for "${key}":` });
      allArgs[key] = value;
    }

    return allArgs;
  }
}
