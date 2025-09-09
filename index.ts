#!/usr/bin/env bun
import { program } from 'commander';
import { name, description, version } from './package.json';
import { check } from '~/actions/check';
import { DEFAULT_IGNORE_PATTERNS, scan } from '~/actions/scan';
import chalk from 'chalk';
import { Stopwatch } from '~/util/stopwatch';
import { mcp } from '~/actions/mcp';

function log(...messages: string[]) {
  console.log(messages.filter(Boolean).join(' '));
}

program.name(name).description(description).version(version);

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
        log(chalk.green('success'), chalk.white.bold(path), chalk.gray(`in [${ms}ms]`));
        break;
      case 'error':
        log(chalk.red('failed'), chalk.white.bold(path), chalk.gray(`in [${ms}ms]`));
        log(`${result.errors.join('\n')}`);
        break;
    }
  });

program
  .command('mcp')
  .description('run an model context protocol (MCP) server')
  .action(async () => {
    try {
      await mcp();
    } catch (e) {
      console.error(chalk.red('Fatal error:'), e instanceof Error ? e.message : e);
      process.exit(1);
    }
  });

program
  .command('scan')
  .description('scans a directory for specs and tags')
  .argument('[patterns...]', 'glob patterns to scan', ['**/*'])
  .option('--ignore [patterns...]', 'glob patterns to ignore', [])
  .action(async (patterns: string[], options: { ignore: string[] }) => {
    const stopwatch = Stopwatch.start();
    const ignore = [...DEFAULT_IGNORE_PATTERNS, ...options.ignore];
    const results = await scan({ patterns, ignore });
    const ms = stopwatch.ms().toFixed(2);

    log(
      chalk.blue('scanned'),
      chalk.white.bold(results.length.toString()),
      results.length === 1 ? 'item' : 'items',
      chalk.gray(`in [${ms}ms]`),
    );

    const specs = results.filter((r) => r.type === 'spec');
    for (const spec of specs) {
      log(
        chalk.yellow('spec'),
        chalk.white.bold(spec.name),
        chalk.gray(`[${spec.ids.length} ids]`),
        chalk.cyan(spec.path),
      );
    }

    const tags = results.filter((r) => r.type === 'tag');
    for (const tag of tags) {
      // Show a better preview: first line, trimmed, or up to 80 chars
      const preview =
        tag.body
          .split('\n')[0] // first line
          .trim()
          .slice(0, 80) + (tag.body.length > 80 ? '...' : '');

      log(
        chalk.magenta('tag'),
        chalk.white.bold(tag.id),
        chalk.gray(preview),
        chalk.cyan(tag.location),
      );
    }
  });

program.parse();
