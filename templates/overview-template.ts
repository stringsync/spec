import { Template } from '~/templates/template';
import overviewTxt from './overview.txt' with { type: 'text' };

export const OVERVIEW_TEMPLATE = Template.static({
  name: 'overview',
  description: 'instructs the assistant how to use @stringsync/spec',
  text: overviewTxt,
});
