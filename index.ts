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

const log = ExtendableLogger.console();

const DEFAULT_PATTERNS = ['**/*'];
const MUST_IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

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
  .argument('[selectors...]', 'fully qualified spec id (e.g. "foo.bar" or "foo")', [])
  .action(async (selectors: string[], options: { include: string[]; exclude: string[] }) => {
    const stopwatch = Stopwatch.start();
    const scope = new Scope({
      includePatterns: options.include,
      excludePatterns: [...MUST_IGNORE_PATTERNS, ...options.exclude],
    });
    const ms = stopwatch.ms().toFixed(2);

    log.spaced.info(chalk.green('success'), chalk.gray(`in [${ms}ms]`));
  });

program
  .command('scan')
  .description('scan for specs and tags')
  .option('-i, --include [patterns...]', 'glob patterns to include', DEFAULT_PATTERNS)
  .option('-e, --exclude [patterns...]', 'glob patterns to exclude', [])
  .argument('[selectors...]', 'fully qualified spec id (e.g. "foo.bar" or "foo")', [])
  .action(async (selectorStrings: string[], options: { include: string[]; exclude: string[] }) => {
    const stopwatch = Stopwatch.start();

    const scope = new Scope({
      includePatterns: options.include,
      excludePatterns: [...MUST_IGNORE_PATTERNS, ...options.exclude],
    });
    const selectors = selectorStrings.map((s) => Selector.parse(s));
    const globber = ExtendableGlobber.fs().autoExpand().cached();
    const result = await scan({ scope, selectors, globber });
    const paths = await globber.glob(scope);

    const ms = stopwatch.ms().toFixed(2);

    log.spaced.info(
      chalk.blue('scanned'),
      chalk.white.bold(paths.length.toString()),
      paths.length === 1 ? 'item' : 'items',
      chalk.gray(`in [${ms}ms]`),
      '\n',
    );

    for (const module of result.modules) {
      let validity = '';
      const errors = module.getErrors();
      if (errors.length === 0) {
        validity = chalk.green('✓ valid');
      } else if (errors.length === 1) {
        validity = chalk.red('✗ 1 error');
      } else {
        validity = chalk.red(`✗ ${errors.length} errors`);
      }

      log.spaced.info(
        chalk.yellow('module'),
        chalk.white.bold(module.getName()),
        chalk.cyan(module.getPath()),
        validity,
      );

      if (errors.length > 0) {
        for (const error of errors) {
          log.spaced.indented().error(chalk.red('error:'), chalk.gray(error));
        }
      }

      const specs = result.specs.filter((s) => module.matches(s));
      for (const spec of specs) {
        log.spaced
          .indented()
          .info(
            chalk.magenta('spec'),
            chalk.white.bold(spec.getName()),
            chalk.cyan(spec.getLocation()),
          );

        const tags = result.tags.filter((t) => spec.matches(t));
        for (const tag of tags) {
          log.spaced
            .indented(2)
            .info(chalk.green('tag'), chalk.cyan(tag.getLocation()), chalk.gray(tag.getContent()));
        }
      }

      log.info(''); // new line between modules
    }

    const specNames = new Set(result.specs.map((s) => s.getName()));
    const orphanedTags = result.tags
      .filter((t) => !specNames.has(t.getSpecName()))
      .filter((t) => selectors.length === 0 || selectors.some((s) => s.matches(t)));
    if (orphanedTags.length > 0) {
      log.spaced.info(chalk.red('orphaned'));
      for (const tag of orphanedTags) {
        log.spaced
          .indented()
          .info(
            chalk.green('tag'),
            chalk.white.bold(tag.getSpecName()),
            chalk.cyan(tag.getLocation()),
            chalk.gray(tag.getContent()),
          );
      }
      log.info('');
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
