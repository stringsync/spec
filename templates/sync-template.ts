import { Template } from '~/templates/template';

export const SYNC_TEMPLATE = Template.unimplemented({
  name: 'sync',
  description:
    'Instructs the agent to align specs with code. It checks that specs are properly tagged, ' +
    'highlights missing or mismatched references, and resolves drift between specs and implementation.',
});
