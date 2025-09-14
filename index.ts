#!/usr/bin/env bun
import { program } from 'commander';
import { name, description, version } from './package.json';
import { Scope } from '~/specs/scope';
import chalk from 'chalk';
import { Stopwatch } from '~/util/stopwatch';
import { InternalError } from '~/util/errors';
import { PromptCLI } from '~/prompts/prompt-cli';
import { mcp } from '~/mcp/mcp';
import { ExtendableLogger } from '~/util/logs/extendable-logger';
import { scan } from '~/actions/scan';
import { Selector } from '~/specs/selector';
import { ExtendableGlobber } from '~/util/globber/extendable-globber';
import { ScanCommandTemplate } from '~/templates/scan-command-template';
import { ShowCommandTemplate } from '~/templates/show-command-template';

const log = ExtendableLogger.console();

const DEFAULT_PATTERNS = ['**/*'];
const MUST_IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

function parseSelector(value: string, previous: Selector[]): Selector[] {
  return [...previous, Selector.parse(value)];
}

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
  .description('show spec details')
  .option('-i, --include [patterns...]', 'glob patterns to include', DEFAULT_PATTERNS)
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
      excludePatterns: [...MUST_IGNORE_PATTERNS, ...options.exclude],
    });
    const globber = ExtendableGlobber.fs().autoExpandDirs();
    const result = await scan({ scope, selectors, globber });
    const ms = stopwatch.ms();
    const template = new ShowCommandTemplate(result, ms);

    log.info(template.render());
  });

program
  .command('scan')
  .description('scan for specs and tags')
  .option('-i, --include [patterns...]', 'glob patterns to include', DEFAULT_PATTERNS)
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
      excludePatterns: [...MUST_IGNORE_PATTERNS, ...options.exclude],
    });
    const globber = ExtendableGlobber.fs().autoExpandDirs().cached();
    const result = await scan({ scope, selectors, globber });
    const paths = await globber.glob(scope);
    const ms = stopwatch.ms();
    const template = new ScanCommandTemplate(result, selectors, paths.length, ms);

    log.info(template.render());
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
