import { Template } from '~/templates/template';

export const REFINE_TEMPLATE = Template.unimplemented({
  name: 'refine',
  description:
    'Instructs the agent to review specs in scope for clarity and scope. ' +
    'It may split, merge, rename, or edit specs to ensure they are precise, consistent, and actionable.',
});
