import describeTxt from './describe.txt' with { type: 'text' };
import { Template } from '~/templates/template';

export const DESCRIBE_TEMPLATE = Template.static({
  name: 'describe',
  description: 'provides an overview of @stringsync/spec and how to use it',
  text: describeTxt,
});
