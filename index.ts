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
import { Markdown } from '~/util/markdown';
import { show } from '~/actions/show';

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
  .option('-p, --pattern [patterns...]', 'glob patterns to scan', DEFAULT_PATTERNS)
  .option('-i, --ignore [patterns...]', 'glob patterns to ignore', [])
  .argument('[selectors...]', 'fully qualified spec id (e.g. "foo.bar")')
  .action(async (selectors: string[], options: { pattern: string[]; ignore: string[] }) => {
    const stopwatch = Stopwatch.start();
    const ignore = [...DEFAULT_IGNORE_PATTERNS, ...(options.ignore ?? [])];

    const scanResults = await scan({ patterns: options.pattern, ignore });
    const specs = scanResults.filter((r) => r.type === 'spec');
    const tags = scanResults.filter((r) => r.type === 'tag');

    const showResults = show({ selectors, specs, tags });
    const ms = stopwatch.ms().toFixed(2);

    switch (showResults.type) {
      case 'success':
        log.info(chalk.green('success'), chalk.gray(`in [${ms}ms]`));
        log.info(showResults.content);
        break;
      case 'error':
        log.error(chalk.red('failed'), chalk.gray(`in [${ms}ms]`));
        log.error(`${showResults.errors.join('\n')}`);
        break;
    }
  });

program
  .command('scan')
  .description('scan for specs and tags')
  .option('-p, --pattern [patterns...]', 'glob patterns to scan', DEFAULT_PATTERNS)
  .option('-i, --ignore [patterns...]', 'glob patterns to ignore', [])
  .action(async (options: { pattern: string[]; ignore: string[] }) => {
    const stopwatch = Stopwatch.start();
    const ignore = [...DEFAULT_IGNORE_PATTERNS, ...(options.ignore ?? [])];
    const results = await scan({ patterns: options.pattern, ignore });
    const ms = stopwatch.ms().toFixed(2);

    log.info(
      chalk.blue('scanned'),
      chalk.white.bold(results.length.toString()),
      results.length === 1 ? 'item' : 'items',
      chalk.gray(`in [${ms}ms]`),
    );

    const specs = results.filter((r) => r.type === 'spec');
    for (const spec of specs) {
      log.info(
        chalk.yellow('spec'),
        chalk.white.bold(spec.name),
        chalk.gray(`[${spec.ids.length} ids]`),
        chalk.cyan(spec.path),
      );
    }

    const tags = results.filter((r) => r.type === 'tag');
    for (const tag of tags) {
      // Show a better preview: first line, trimmed, or up to 80 chars
      const preview = tag.body
        .split('\n')[0] // first line
        .trim();

      log.info(
        chalk.magenta('tag'),
        chalk.white.bold(tag.id),
        chalk.gray(preview),
        chalk.cyan(tag.location),
      );
    }
  });

program
  .command('check')
  .description('validates a spec file')
  .argument('<path>', 'path to spec file')
  .action(async (path: string) => {
    const stopwatch = Stopwatch.start();
    const result = await check({ path });
    const ms = stopwatch.ms().toFixed(2);

    switch (result.type) {
      case 'success':
        log.info(chalk.green('success'), chalk.white.bold(path), chalk.gray(`in [${ms}ms]`));
        break;
      case 'error':
        log.error(chalk.red('failed'), chalk.white.bold(path), chalk.gray(`in [${ms}ms]`));
        log.error(`${result.errors.join('\n')}`);
        break;
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
