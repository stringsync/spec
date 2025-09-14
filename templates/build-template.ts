import z from 'zod';
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';
import { Template } from '~/templates/template';
import buildTxt from './build.txt' with { type: 'raw' };

export const BUILD_TEMPLATE = Template.dynamic({
  name: 'build',
  description:
    'Instructs the agent to complete existing TODOs, especially those created by the plan prompt. ' +
    'It turns placeholders into working implementations that follow the specs.',
  input: {
    selector: z.string(),
  },
  render: (args) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(buildTxt, {
        selector: args.selector,
      }),
    });
  },
});
