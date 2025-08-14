import { program } from 'commander';
import { coverage } from './coverage';
import { markdown } from './markdown';

program.name('intentx').description('CLI for managing intents');

program
  .command('coverage')
  .description('Run a command and track intent events')
  .argument('[args...]', 'The command to run')
  .action(async () => {
    await coverage();
  });

program
  .command('markdown')
  .description('View a spec as markdown')
  .argument('[paths...]', 'The paths of the spec files (which can take globs)')
  .action(async (paths: string[]) => {
    console.warn('[UNIMPLEMENTED] got paths:', paths);
    await markdown();
  });

program.parse();
