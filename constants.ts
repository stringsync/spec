import { AUDIT_TEMPLATE } from '~/templates/audit-template';
import { BUILD_TEMPLATE } from '~/templates/build-template';
import { PLAN_TEMPLATE } from '~/templates/plan-template';
import type { Template } from '~/templates/template';

const DEFAULT_INCLUDE_PATTERNS = ['**/*'];
const MUST_EXCLUDE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];
const PROMPT_TEMPLATES: Template[] = [AUDIT_TEMPLATE, PLAN_TEMPLATE, BUILD_TEMPLATE];

export const constants = {
  DEFAULT_INCLUDE_PATTERNS,
  MUST_EXCLUDE_PATTERNS,
  PROMPT_TEMPLATES,
};
