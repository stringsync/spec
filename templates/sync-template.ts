import z from 'zod';
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';
import { Template } from '~/templates/template';
import syncTxt from './sync.txt' with { type: 'raw' };

export const SYNC_TEMPLATE = Template.dynamic({
  name: 'sync',
  description:
    'Instructs the agent to align specs with code. It checks that specs are properly tagged, ' +
    'highlights missing or mismatched references, and resolves drift between specs and implementation.',
  input: {
    selector: z.string(),
  },
  render: (args) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(syncTxt, {
        selector: args.selector,
      }),
    });
  },
});
