import type { Prompt } from '~/prompts/prompt';
import describeTxt from './describe.txt' with { type: 'text' };
import z from 'zod';

export class DescribePrompt implements Prompt<{}> {
  readonly name = 'describe';
  readonly description =
    'instructs the assistant how to describe the project using @stringsync/spec';
  readonly schema = z.object({});

  render() {
    return describeTxt;
  }
}
