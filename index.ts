#!/usr/bin/env bun
import { program } from 'commander';
import { name, description, version } from './package.json';
import { Scope } from '~/specs/scope';
import { Stopwatch } from '~/util/stopwatch';
import { mcp } from '~/mcp/mcp';
import { ExtendableLogger } from '~/util/logs/extendable-logger';
import { scan } from '~/actions/scan';
import { Selector } from '~/specs/selector';
import { ExtendableGlobber } from '~/util/globber/extendable-globber';
import { SCAN_COMMAND_TEMPLATE } from '~/templates/scan-command-template';
import { constants } from '~/constants';
import { SHOW_COMMAND_TEMPLATE } from '~/templates/show-command-template';
import { InteractivePrompt } from '~/templates/interactive-prompt';

const log = ExtendableLogger.console();

program.name(name).description(description).version(version);

program
  .command('mcp')
  .description('run an model context protocol (MCP) server')
  .action(async () => {
    await mcp();
  });

program
  .command('show')
  .description('show spec details')
  .option(
    '-i, --include [patterns...]',
    'glob patterns to include',
    constants.DEFAULT_INCLUDE_PATTERNS,
  )
  .option('-e, --exclude [patterns...]', 'glob patterns to exclude', [])
  .argument(
    '[selectors...]',
    'fully qualified spec id (e.g. "foo.bar" or "foo")',
    parseSelector,
    [],
  )
  .action(async (selectors: Selector[], options: { include: string[]; exclude: string[] }) => {
    const stopwatch = Stopwatch.start();

    const scope = new Scope({
      includePatterns: options.include,
      excludePatterns: [...constants.MUST_EXCLUDE_PATTERNS, ...options.exclude],
    });
    const globber = ExtendableGlobber.fs().autoExpandDirs().freeze();
    const result = await scan({ scope, selectors, globber });
    const ms = stopwatch.ms();

    log.info(SHOW_COMMAND_TEMPLATE.render({ result, ms }));
  });

program
  .command('scan')
  .description('scan for specs and tags')
  .option(
    '-i, --include [patterns...]',
    'glob patterns to include',
    constants.DEFAULT_INCLUDE_PATTERNS,
  )
  .option('-e, --exclude [patterns...]', 'glob patterns to exclude', [])
  .argument(
    '[selectors...]',
    'fully qualified spec id (e.g. "foo.bar" or "foo")',
    parseSelector,
    [],
  )
  .action(async (selectors: Selector[], options: { include: string[]; exclude: string[] }) => {
    const stopwatch = Stopwatch.start();

    const scope = new Scope({
      includePatterns: options.include,
      excludePatterns: [...constants.MUST_EXCLUDE_PATTERNS, ...options.exclude],
    });
    const globber = ExtendableGlobber.fs().autoExpandDirs().cached().freeze();
    const result = await scan({ scope, selectors, globber });
    const paths = await globber.glob(scope);
    const ms = stopwatch.ms();

    log.info(
      SCAN_COMMAND_TEMPLATE.render({
        result,
        selectors,
        pathCount: paths.length,
        ms,
      }),
    );
  });

program
  .command('prompt')
  .description('generate a prompt')
  .argument('[name]', 'name of the prompt')
  .option('--arg <values...>', 'arguments for the prompt format: [key=value]', parseArgs, {})
  .option('--pipe', 'pipe output to another program', false)
  .action(
    async (name: string | undefined, options: { args: Record<string, string>; pipe: boolean }) => {
      const cli = new InteractivePrompt(log, constants.PROMPT_TEMPLATES);
      await cli.run(name, options.args, options.pipe);
    },
  );

program.parse();

function parseSelector(value: string, previous: Selector[]): Selector[] {
  return [...previous, Selector.parse(value)];
}

function parseArgs(value: string, previous: Record<string, string>): Record<string, string> {
  const [key, val] = value.split('=');
  if (!key || !val) {
    throw new Error(`invalid argument: ${value}`);
  }
  return { ...previous, [key]: val };
}
