import { Template } from '~/templates/template';

export const PLAN_TEMPLATE = Template.todo({
  name: 'plan',
  description:
    'Instructs the agent to generate skeletal code structures from specs. ' +
    'It creates files, classes, or functions with detailed TODO placeholders that guide later implementation.',
});
