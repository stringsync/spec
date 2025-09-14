import type { Prompt } from '~/prompts/prompt';
import overviewTxt from './overview.txt' with { type: 'text' };
import z from 'zod';

export class OverviewPrompt implements Prompt<{}> {
  readonly name = 'overview';
  readonly description = 'instructs the assistant how to use @stringsync/spec';
  readonly schema = z.object({});

  render() {
    return overviewTxt;
  }
}
