import { Template } from '~/templates/template';

export const BUILD_TEMPLATE = Template.todo({
  name: 'build',
  description:
    'Instructs the agent to complete existing TODOs, especially those created by the plan prompt. ' +
    'It turns placeholders into working implementations that follow the specs.',
});
