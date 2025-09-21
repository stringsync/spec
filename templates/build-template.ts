import z from 'zod';
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';
import { Template } from '~/templates/template';
import buildTxt from './build.txt' with { type: 'raw' };
import { STRING_SELECTOR } from '~/templates/args';

export const BUILD_TEMPLATE = Template.dynamic({
  name: 'build',
  description:
    'Instructs the agent to complete existing TODOs, ' +
    'turning placeholders into working implementations that follow the specs.',
  input: {
    selector: STRING_SELECTOR,
  },
  render: (args) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(buildTxt, {
        selector: args.selector,
      }),
    });
  },
});
