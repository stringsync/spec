import z from 'zod';
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';
import { Template } from '~/templates/template';
import auditTxt from './audit.txt' with { type: 'raw' };
import { STRING_SELECTOR } from '~/templates/args';

export const AUDIT_TEMPLATE = Template.dynamic({
  name: 'audit',
  description:
    'Instructs the agent to perform a comprehensive audit combining drift detection and spec improvement. ' +
    'It checks alignment between specs and code while also evaluating specs for clarity, scope, and consistency.',
  input: {
    selector: STRING_SELECTOR,
  },
  render: (args) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(auditTxt, {
        selector: args.selector,
      }),
    });
  },
});
