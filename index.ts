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
import type { ZodRawShape } from 'zod';

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
  .option('-f, --filter [strings...]', 'tag content substrings to filter by', [])
  .argument(
    '<selectors...>',
    'fully qualified spec id (e.g. "foo.bar" or "foo")',
    parseSelector,
    [],
  )
  .action(
    async (
      selectors: Selector[],
      options: { include: string[]; exclude: string[]; filter: string[] },
    ) => {
      const stopwatch = Stopwatch.start();

      const scope = new Scope({
        includePatterns: options.include,
        excludePatterns: [...constants.MUST_EXCLUDE_PATTERNS, ...options.exclude],
      });
      const globber = ExtendableGlobber.fs().autoExpandDirs().freeze();
      const result = await scan({ scope, selectors, globber, tagFilters: options.filter });
      const ms = stopwatch.ms();

      log.info(SHOW_COMMAND_TEMPLATE.render({ result, ms }));
    },
  );

program
  .command('scan')
  .description('scan for specs and tags')
  .option(
    '-i, --include [patterns...]',
    'glob patterns to include',
    constants.DEFAULT_INCLUDE_PATTERNS,
  )
  .option('-e, --exclude [patterns...]', 'glob patterns to exclude', [])
  .option('-f, --filter [strings...]', 'tag content substrings to filter by', [])
  .argument(
    '[selectors...]',
    'fully qualified spec id (e.g. "foo.bar" or "foo")',
    parseSelector,
    [],
  )
  .action(
    async (
      selectors: Selector[],
      options: { include: string[]; exclude: string[]; filter: string[] },
    ) => {
      const stopwatch = Stopwatch.start();

      const scope = new Scope({
        includePatterns: options.include,
        excludePatterns: [...constants.MUST_EXCLUDE_PATTERNS, ...options.exclude],
      });
      const globber = ExtendableGlobber.fs().autoExpandDirs().cached().freeze();
      const result = await scan({ scope, selectors, globber, tagFilters: options.filter });
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
    },
  );

// Create the main prompt command
const promptCommand = program.command('prompt').description('generate prompts');

// Dynamically generate subcommands for each prompt template
for (const template of constants.PROMPT_TEMPLATES) {
  const command = promptCommand.command(template.name).description(template.description);

  // Add options based on the template's schema
  const schemaShape = template.schema.shape as ZodRawShape;
  for (const [key, type] of Object.entries(schemaShape)) {
    let value = `<${key}>`;
    if (type.isOptional()) {
      value = `[${key}]`;
    }
    command.option(`--${key} ${value}`, type.description ?? `${key} parameter`);
  }

  command.action(async (options: Record<string, any>) => {
    try {
      // Parse and validate the options using the template's schema
      const parsedArgs = template.schema.parse(options);
      const result = template.render(parsedArgs);
      log.info(result);
    } catch (error) {
      if (error instanceof Error) {
        log.error(`Error: ${error.message}`);
      } else {
        log.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });
}

program.parse();

function parseSelector(value: string, previous: Selector[]): Selector[] {
  return [...previous, Selector.parse(value)];
}
