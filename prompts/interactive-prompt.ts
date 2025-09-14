import { type ZodRawShape } from 'zod';
import { select, input } from '@inquirer/prompts';
import type { Logger } from '~/util/logs/logger';
import type { Template } from '~/templates/template';

export class InteractivePrompt {
  constructor(
    private log: Logger,
    private templates: Template[],
  ) {}

  async run(name: string | undefined, args: Record<string, string>, pipe: boolean) {
    if (pipe) {
      // Non-interactive mode for piping
      const template = this.getTemplateOrThrow(name);
      const allArgs = this.getArgsOrThrow(template, args);
      const parsedArgs = template.schema.parse(allArgs);
      this.log.info(template.render(parsedArgs));
      return;
    }

    // Interactive mode
    await this.runInteractive(name, args);
  }

  private async runInteractive(name?: string, existingArgs: Record<string, string> = {}) {
    const template = await this.getTemplateInteractive(name);
    const allArgs = await this.getMissingArgsInteractive(template, existingArgs);
    const parsedArgs = template.schema.parse(allArgs);
    this.log.info(template.render(parsedArgs));
  }

  private getTemplateOrThrow(name?: string): Template {
    if (!name) {
      throw new Error('Template name is required in non-interactive mode.');
    }
    const template = this.templates.find((t) => t.name === name);
    if (!template) {
      throw new Error(`Template not found: ${name}`);
    }
    return template;
  }

  private async getTemplateInteractive(name?: string): Promise<Template> {
    if (name) {
      return this.getTemplateOrThrow(name);
    }

    const selectedName = await select({
      message: 'Select a template',
      choices: this.templates.map((t) => ({
        name: t.name,
        value: t.name,
        description: t.description,
      })),
    });

    return this.getTemplateOrThrow(selectedName);
  }

  private getArgsOrThrow(template: Template, args: Record<string, string>): Record<string, string> {
    const schema = template.schema;
    const shape = schema.shape as ZodRawShape;
    const requiredKeys = Object.keys(shape);

    if (requiredKeys.length === 0) {
      return {};
    }

    for (const key of Object.keys(args)) {
      if (!requiredKeys.includes(key)) {
        throw new Error(`Unknown argument: ${key}`);
      }
    }

    const missingKeys = requiredKeys.filter((key) => !args[key]);
    if (missingKeys.length > 0) {
      throw new Error(
        `Missing arguments for template "${template.name}": ${missingKeys.join(', ')}`,
      );
    }

    return args;
  }

  private async getMissingArgsInteractive(
    template: Template,
    existingArgs: Record<string, string>,
  ): Promise<Record<string, string>> {
    const allArgs = { ...existingArgs };
    const schema = template.schema;
    const shape = schema.shape as ZodRawShape;
    const requiredKeys = Object.keys(shape);

    const missingKeys = requiredKeys.filter((key) => !allArgs[key]);

    if (missingKeys.length > 0) {
      this.log.info(`Template: ${template.name}`);
      if (template.description) {
        this.log.info(template.description);
      }
    }

    for (const key of missingKeys) {
      const value = await input({ message: `Enter value for "${key}":` });
      allArgs[key] = value;
    }

    return allArgs;
  }
}
