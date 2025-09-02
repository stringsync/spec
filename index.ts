#!/usr/bin/env bun
import { program } from 'commander';
import { name, description, version } from './package.json';
import { validate } from '~/actions/validate';
import chalk from 'chalk';

function log(...messages: string[]) {
  console.log(messages.join(' '));
}

program.name(name).description(description).version(version);

program
  .command('validate')
  .description('validates a spec file')
  .argument('<path>', 'path to spec file')
  .action(async (path: string) => {
    const result = await validate({ path });

    switch (result.type) {
      case 'success':
        log(
          chalk.green('success'),
          chalk.white.bold(path),
          chalk.gray(`in [${result.ms.toFixed(2)}ms]`),
        );
        break;
      case 'error':
        log(
          chalk.red('failed'),
          chalk.white.bold(path),
          chalk.gray(`in [${result.ms.toFixed(2)}ms]`),
        );
        log(`${result.errors.join('\n\n')}`);
        break;
    }
  });

program.parse();
