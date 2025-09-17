import { Template } from '~/templates/template';
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';
import z from 'zod';

export const ASK_TEMPLATE = Template.dynamic({
  name: 'ask',
  description: 'Ask a question and get a detailed answer.',
  input: {
    request: z.string(),
  },
  render: ({ request }) => {
    return PREAMBLE_TEMPLATE.render({ request });
  },
});
