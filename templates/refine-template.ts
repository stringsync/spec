import { Template } from '~/templates/template';

export const REFINE_TEMPLATE = Template.todo({
  name: 'refine',
  description:
    'Instructs the agent to review specs in scope for clarity and scope. ' +
    'It may split, merge, rename, or edit specs to ensure they are precise, consistent, and actionable.',
  input: {},
  render: () => {
    return `You are an expert software engineer. Your task is to refine the following specifications to ensure they are clear, consistent, and actionable.`;
  },
});
