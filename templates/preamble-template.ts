import z from 'zod';
import { Template } from '~/templates/template';
import preambleTxt from './preamble.txt' with { type: 'raw' };

export const PREAMBLE_TEMPLATE = Template.dynamic({
  name: 'preamble',
  description:
    'A system prompt that provides context about the "@stringsync/spec" library and how to use it effectively.',
  input: { request: z.string() },
  render: ({ request }) => {
    return Template.replace(preambleTxt, { request });
  },
});
