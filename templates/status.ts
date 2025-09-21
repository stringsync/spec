import { SELECTOR, STRING_SELECTOR } from '~/templates/args';
import { Template } from '~/templates/template';
import statusTxt from './status.txt' with { type: 'text' };
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';

export const STATUS_TEMPLATE = Template.dynamic({
  name: 'status',
  description: 'Evaluate the implementation status of specs',
  input: {
    selector: STRING_SELECTOR,
  },
  render: (input) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(statusTxt, { selector: input.selector }),
    });
  },
});
