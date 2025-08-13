import { program } from 'commander';

program.name('intentx').description('CLI for managing intents');

program
  .command('coverage')
  .description('Run a command and track intent events')
  .argument('[args...]', 'The command to run')
  .action(async (args: string[]) => {
    console.log('[UNIMPLEMENTED] got args:', args);
  });

program
  .command('markdown')
  .description('View a spec as markdown')
  .argument('[paths...]', 'The paths of the spec files (which can take globs)')
  .action(async (paths: string[]) => {
    console.log('[UNIMPLEMENTED] got paths:', paths);
  });

program.parse();
