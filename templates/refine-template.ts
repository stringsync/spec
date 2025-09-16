import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';
import { Template } from '~/templates/template';
import refineTxt from './refine.txt' with { type: 'raw' };
import z from 'zod';

export const REFINE_TEMPLATE = Template.dynamic({
  name: 'refine',
  description:
    'Instructs the agent to review specs in scope for clarity and scope. ' +
    'It may split, merge, rename, or edit specs to ensure they are precise, consistent, and actionable.',
  input: {
    selector: z.string(),
  },
  render: (args) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(refineTxt, {
        selector: args.selector,
      }),
    });
  },
});
