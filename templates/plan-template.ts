import z from 'zod';
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';
import { Template } from '~/templates/template';
import planTxt from './plan.txt' with { type: 'raw' };

export const PLAN_TEMPLATE = Template.dynamic({
  name: 'plan',
  description:
    'Instructs the agent to generate skeletal code structures from specs. ' +
    'It creates files, classes, or functions with detailed TODO placeholders that guide later implementation.',
  input: {
    selector: z.string(),
  },
  render: (args) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(planTxt, {
        selector: args.selector,
      }),
    });
  },
});
