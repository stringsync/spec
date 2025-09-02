#!/usr/bin/env bun
import { program } from 'commander';
import { name, description, version } from './package.json';
import { validate } from '~/actions/validate';

program.name(name).description(description).version(version);

program
  .command('validate')
  .description('validates a spec file')
  .argument('<path>', 'path to spec file')
  .action(async (path: string) => {
    await validate({ path });
  });

program.parse();
