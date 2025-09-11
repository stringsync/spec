import fs from 'fs';
import path from 'path';
import { Stopwatch } from '~/util/stopwatch';
import chalk from 'chalk';
import { ConsoleLogger } from '~/util/logs/console-logger';
import { SpacedLogger } from '~/util/logs/spaced-logger';

const log = new SpacedLogger(new ConsoleLogger());

async function main(): Promise<void> {
  log.info('building @stringsync/spec...');

  const stopwatch = Stopwatch.start();
  const distDir = path.resolve(__dirname, '..', 'dist');

  try {
    // Clean and create dist directory
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });

    // Build with Bun
    const projectRoot = path.resolve(__dirname, '..');
    const entrypoint = path.join(projectRoot, 'index.ts');
    const outdir = path.join(projectRoot, 'dist');

    const result = await Bun.build({
      entrypoints: [entrypoint],
      outdir,
      target: 'node',
      format: 'esm',
      minify: false,
      sourcemap: 'none',
      external: ['@inquirer/prompts', 'commander', 'chalk'],
    });

    if (!result.success) {
      throw new Error(`Build failed: ${result.logs.map((log) => log.message).join('\n')}`);
    }

    // Make executable
    const mainFile = path.join(distDir, 'index.js');

    if (fs.existsSync(mainFile)) {
      // Read the file content
      let content = fs.readFileSync(mainFile, 'utf8');

      // Replace the bun shebang with node shebang for broader compatibility
      content = content.replace('#!/usr/bin/env bun', '#!/usr/bin/env node');

      // Write back the modified content
      fs.writeFileSync(mainFile, content);

      // Make it executable
      fs.chmodSync(mainFile, '755');
    } else {
      throw new Error('Main entry point not found after build');
    }

    log.info(
      chalk.green('built'),
      chalk.white.bold('@stringsync/spec'),
      chalk.gray(`in [${stopwatch.ms().toFixed(2)}ms]`),
    );
  } catch (error) {
    log.error(chalk.red('failure'), error);
  }
}

main();
