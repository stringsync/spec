import { ASK_TEMPLATE } from '~/templates/ask-template';
import { AUDIT_TEMPLATE } from '~/templates/audit-template';
import { BUILD_TEMPLATE } from '~/templates/build-template';
import { PLAN_TEMPLATE } from '~/templates/plan-template';
import { STATUS_TEMPLATE } from '~/templates/status';
import type { Template } from '~/templates/template';
import { TIDY_TEMPLATE } from '~/templates/tidy';

const DEFAULT_INCLUDE_PATTERNS = ['**/*'];
const MUST_EXCLUDE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/cdk.out/**'];
const PROMPT_TEMPLATES: Template[] = [
  ASK_TEMPLATE,
  STATUS_TEMPLATE,
  AUDIT_TEMPLATE,
  PLAN_TEMPLATE,
  BUILD_TEMPLATE,
  TIDY_TEMPLATE,
];

export const constants = {
  DEFAULT_INCLUDE_PATTERNS,
  MUST_EXCLUDE_PATTERNS,
  PROMPT_TEMPLATES,
};
