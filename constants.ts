import { BUILD_TEMPLATE } from '~/templates/build-template';
import { DESCRIBE_TEMPLATE } from '~/templates/describe-template';
import { OVERVIEW_TEMPLATE } from '~/templates/overview-template';
import { PLAN_TEMPLATE } from '~/templates/plan-template';
import { REFINE_TEMPLATE } from '~/templates/refine-template';
import { SYNC_TEMPLATE } from '~/templates/sync-template';
import type { Template } from '~/templates/template';

const DEFAULT_INCLUDE_PATTERNS = ['**/*'];
const MUST_EXCLUDE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];
const PROMPT_TEMPLATES: Template[] = [
  OVERVIEW_TEMPLATE,
  DESCRIBE_TEMPLATE,
  REFINE_TEMPLATE,
  SYNC_TEMPLATE,
  PLAN_TEMPLATE,
  BUILD_TEMPLATE,
];

export const constants = {
  DEFAULT_INCLUDE_PATTERNS,
  MUST_EXCLUDE_PATTERNS,
  PROMPT_TEMPLATES,
};
