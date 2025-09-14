import { DescribePrompt } from '~/prompts/describe-prompt';
import { OverviewPrompt } from '~/prompts/overview-prompt';
import type { Prompt } from '~/prompts/prompt';

const DEFAULT_INCLUDE_PATTERNS = ['**/*'];
const MUST_EXCLUDE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];
const PROMPTS: Prompt<any>[] = [new OverviewPrompt(), new DescribePrompt()];

export const constants = {
  DEFAULT_INCLUDE_PATTERNS,
  MUST_EXCLUDE_PATTERNS,
  PROMPTS,
};
