import { program } from 'commander';
import { coverage } from './coverage';
import { markdown } from './markdown';
import { InMemoryIntentStorage } from './in-memory-intent-storage';
import { IntentService } from './intent-service';
import { BunIntentServer } from './bun-intent-server';
import { BunCommand } from '@stringsync/core/src/command/bun-command';

program.name('intentx').description('CLI for managing intents');

program
  .command('coverage')
  .description('Run a command and track intent events')
  .argument('[args...]', 'The command to run')
  .action(async (args: string[]) => {
    const intentStorage = new InMemoryIntentStorage();
    const intentService = new IntentService(intentStorage);
    const intentServer = new BunIntentServer(intentService);

    const command = new BunCommand({
      cmd: args,
      env: {
        ...process.env,
        INTENT_ROLE: 'coverage',
      },
    });

    await coverage({ intentServer, command });

    const events = await intentService.getAllIntentEvents();
    console.log(events);

    process.exit();
  });

program
  .command('markdown')
  .description('View a spec as markdown')
  .argument('path', 'The spec file path')
  .option('-v, --var <name>', 'The variable name of the exported spec, default: "spec"', 'spec')
  .action(async (path: string, opts: { var: string }) => {
    await markdown({ path, exportedVariableName: opts.var });
  });

program.parse();
