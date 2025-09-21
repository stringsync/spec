import { Template } from '~/templates/template';
import tidyTxt from './tidy.txt' with { type: 'text' };
import { STRING_SELECTOR } from '~/templates/args';
import { PREAMBLE_TEMPLATE } from '~/templates/preamble-template';

export const TIDY_TEMPLATE = Template.dynamic({
  name: 'tidy',
  description: 'Find duplicate or redundant spec tags and consolidate or remove them safely',
  input: {
    selector: STRING_SELECTOR,
  },
  render: (input) => {
    return PREAMBLE_TEMPLATE.render({
      request: Template.replace(tidyTxt, { selector: input.selector }),
    });
  },
});
