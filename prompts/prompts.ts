import { DescribePrompt } from '~/prompts/describe-prompt';
import { OverviewPrompt } from '~/prompts/overview-prompt';
import type { Prompt } from '~/prompts/prompt';

export const PROMPTS: Prompt<any>[] = [new OverviewPrompt(), new DescribePrompt()];
