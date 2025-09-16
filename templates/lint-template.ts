import z from 'zod';
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';
import { Template } from '~/templates/template';
import lintTxt from './lint.txt' with { type: 'raw' };

export const LINT_TEMPLATE = Template.dynamic({
  name: 'lint',
  description:
    'Instructs the agent to report alignment between specs and code. It checks that specs are properly tagged, ' +
    'highlights missing or mismatched references, and reports drift between specs and implementation.',
  input: {
    selector: z.string(),
  },
  render: (args) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(lintTxt, {
        selector: args.selector,
      }),
    });
  },
});
