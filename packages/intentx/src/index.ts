#!/usr/bin/env bun
import { program } from 'commander';
import { md } from './actions/md';
import { NodeFileSystem } from '@stringsync/core';
import { scan } from './actions/scan';

program.name('intentx').description('CLI for managing intents');

program
  .command('scan')
  .description('detect intents in code')
  .argument('path', 'path to the tsconfig file')
  .action(async (path: string) => {
    const fileSystem = new NodeFileSystem();

    const events = await scan({ tsConfigPath: path, fileSystem });

    console.log(events);

    process.exit();
  });

program
  .command('md')
  .description('view a spec as markdown')
  .argument('path', 'the spec file path')
  .option('-v, --var <name>', 'the variable name of the exported spec')
  .action(async (path: string, opts: { var?: string }) => {
    const markdown = await md({ path, exportedVariableName: opts.var });

    console.log(markdown);

    process.exit();
  });

program.parse();
