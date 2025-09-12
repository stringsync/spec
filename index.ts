#!/usr/bin/env bun
import { program } from 'commander';
import { name, description, version } from './package.json';
import { check } from '~/actions/check';
import { DEFAULT_IGNORE_PATTERNS, DEFAULT_PATTERNS, scan } from '~/actions/scan';
import chalk from 'chalk';
import { Stopwatch } from '~/util/stopwatch';
import { mcp } from '~/actions/mcp';
import { InternalError } from '~/util/errors';
import { ConsoleLogger } from '~/util/logs/console-logger';
import { SpacedLogger } from '~/util/logs/spaced-logger';
import { PromptCLI } from '~/prompts/prompt-cli';
import { show } from '~/actions/show';
import { IndentedLogger } from '~/util/logs/indented-logger';

const log = new SpacedLogger(new ConsoleLogger());

program.name(name).description(description).version(version);

program
  .command('mcp')
  .description('run an model context protocol (MCP) server')
  .action(async () => {
    try {
      await mcp();
    } catch (e) {
      log.error(chalk.red('Fatal error:'), InternalError.wrap(e).message);
      process.exit(1);
    }
  });

program
  .command('show')
  .description('show a spec id')
  .option('-i, --include [patterns...]', 'glob patterns to include', DEFAULT_PATTERNS)
  .option('-e, --exclude [patterns...]', 'glob patterns to exclude', [])
  .argument('[selectors...]', 'fully qualified spec id (e.g. "foo.bar")')
  .action(async (selectors: string[], options: { include: string[]; exclude: string[] }) => {
    const stopwatch = Stopwatch.start();
    const ignore = [...DEFAULT_IGNORE_PATTERNS, ...options.exclude];

    const { specs, tags } = await scan({ patterns: options.include, ignore });
    const results = show({ selectors, specs, tags });
    const ms = stopwatch.ms().toFixed(2);

    switch (results.type) {
      case 'success':
        log.info(chalk.green('success'), chalk.gray(`in [${ms}ms]`));
        log.info(results.content);
        break;
      case 'error':
        log.error(chalk.red('failed'), chalk.gray(`in [${ms}ms]`));
        log.error(`${results.errors.join('\n')}`);
        break;
    }
  });

program
  .command('scan')
  .description('scan for specs and tags')
  .option('-i, --include [patterns...]', 'glob patterns to include', DEFAULT_PATTERNS)
  .option('-e, --exclude [patterns...]', 'glob patterns to exclude', [])
  .action(async (options: { include: string[]; exclude: string[] }) => {
    const stopwatch = Stopwatch.start();
    const ignore = [...DEFAULT_IGNORE_PATTERNS, ...options.exclude];
    const results = await scan({ patterns: options.include, ignore });
    const ms = stopwatch.ms().toFixed(2);
    const length = results.specs.length + results.tags.length;

    log.info(
      chalk.blue('scanned'),
      chalk.white.bold(length.toString()),
      length === 1 ? 'item' : 'items',
      chalk.gray(`in [${ms}ms]`),
    );

    for (const spec of results.specs) {
      let validity = '';
      if (spec.errors.length === 0) {
        validity = chalk.green('✓ valid');
      } else if (spec.errors.length === 1) {
        validity = chalk.red('✗ 1 error');
      } else {
        validity = chalk.red(`✗ ${spec.errors.length} errors`);
      }

      log.info(chalk.yellow('spec'), chalk.white.bold(spec.name), chalk.cyan(spec.path), validity);

      let ilog = new IndentedLogger(log, 1);
      if (spec.errors.length > 0) {
        for (const error of spec.errors) {
          ilog.error(chalk.red('error:'), chalk.gray(error));
        }
      }
    }

    for (const tag of results.tags) {
      log.info(
        chalk.magenta('tag'),
        chalk.white.bold(tag.id),
        chalk.cyan(tag.location),
        chalk.gray(tag.body),
      );
    }
  });

program
  .command('prompt')
  .description('generate a prompt')
  .argument('[name]', 'name of the prompt')
  .option('--arg <values...>', 'arguments for the prompt format: [key=value]')
  .option('--pipe', 'pipe output to another program', false)
  .action(async (name: string | undefined, options: { arg?: string[]; pipe: boolean }) => {
    try {
      const args: Record<string, string> = {};
      if (options.arg) {
        for (const arg of options.arg) {
          const [key, value] = arg.split('=');
          if (!key || !value) {
            throw new Error(`invalid argument: ${arg}`);
          }
          args[key] = value;
        }
      }
      const log = new ConsoleLogger();
      await new PromptCLI(log).run(name, args, options.pipe);
    } catch (e) {
      if (options.pipe) {
        log.error(InternalError.wrap(e).message);
      } else {
        log.error(chalk.red('error:'), InternalError.wrap(e).message);
      }
      process.exit(1);
    }
  });

program.parse();
