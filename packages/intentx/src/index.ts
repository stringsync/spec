#!/usr/bin/env bun
import { program } from 'commander';
import { markdown } from './actions/markdown';
import { NodeFileSystem } from '@stringsync/core';
import { scan } from './actions/scan';

program.name('intentx').description('CLI for managing intents');

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
