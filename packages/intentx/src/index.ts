#!/usr/bin/env bun
import { program } from 'commander';
import { coverage } from './actions/coverage';
import { markdown } from './actions/markdown';
import { InMemoryIntentStorage } from './intent-storage/in-memory-intent-storage';
import { IntentService } from './intent-service';
import { BunIntentServer } from './intent-server/bun-intent-server';
import { BunCommand, NodeFileSystem } from '@stringsync/core';
import { scan } from './actions/scan';

program.name('intentx').description('CLI for managing intents');

program
  .command('coverage')
  .description('run a command and track intent events')
  .argument('[args...]', 'the command to run')
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
  .command('scan')
  .description('best effort attempt to detect intents in code')
  .argument('path', 'path to the tsconfig file')
  .action(async (path: string) => {
    const fileSystem = new NodeFileSystem();

    const events = await scan({ tsConfigPath: path, fileSystem });

    console.log(events);

    process.exit();
  });

program
  .command('markdown')
  .description('view a spec as markdown')
  .argument('path', 'the spec file path')
  .option('-v, --var <name>', 'the variable name of the exported spec')
  .action(async (path: string, opts: { var?: string }) => {
    const md = await markdown({ path, exportedVariableName: opts.var });

    console.log(md);

    process.exit();
  });

program.parse();
