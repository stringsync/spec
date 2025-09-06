#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Stopwatch } from '~/util/stopwatch';
import chalk from 'chalk';

function cleanAndCreateDistDirectory(distDir: string): void {
  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  // Create dist directory
  fs.mkdirSync(distDir, { recursive: true });
}

function compileTypeScript(): void {
  execSync(
    'bunx tsc --outDir dist --rootDir . --module ESNext --target ES2022 --moduleResolution bundler --allowSyntheticDefaultImports --esModuleInterop --skipLibCheck --declaration false --sourceMap false --noEmit false --verbatimModuleSyntax false --allowImportingTsExtensions false',
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    },
  );
}

function fixImports(dir: string): void {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace ~/ imports with relative paths
      content = content.replace(/from ['"]~\/([^'"]+)['"]/g, (match, importPath) => {
        const relativePath = path.relative(path.dirname(filePath), path.join(dir, importPath));
        return `from './${relativePath.replace(/\\/g, '/')}.js'`;
      });

      // Add .js extensions to relative imports that don't have them
      content = content.replace(/from ['"](\.[^'"]*?)(?<!\.js)['"]/g, (match, importPath) => {
        // Don't add .js to imports that already have an extension or are directories
        if (importPath.includes('.') && !importPath.endsWith('/')) {
          return match; // Already has an extension
        }
        return `from '${importPath}.js'`;
      });

      // Fix JSON imports to include the type assertion and convert named imports to default imports
      content = content.replace(
        /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]*\.json)['"]/g,
        (match, namedImports, jsonPath) => {
          const imports = namedImports.split(',').map((imp: string) => imp.trim());
          const tempVar = 'pkg';
          const destructuring = `const { ${imports.join(', ')} } = ${tempVar};`;
          return `import ${tempVar} from '${jsonPath}' with { type: 'json' };\n${destructuring}`;
        },
      );

      // Handle other JSON imports (but not ones that already have the with clause)
      content = content.replace(
        /from ['"]([^'"]*\.json)['"](?!\s*with)/g,
        `from '$1' with { type: 'json' }`,
      );

      fs.writeFileSync(filePath, content);
    }
  }
}

function makeExecutable(distDir: string): void {
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
}

function main(): void {
  const stopwatch = Stopwatch.start();
  const distDir = path.resolve(__dirname, '..', 'dist');

  try {
    console.log(chalk.white('building @stringsync/spec...'));

    cleanAndCreateDistDirectory(distDir);

    console.log(chalk.gray('Compiling TypeScript...'));
    compileTypeScript();

    console.log(chalk.gray('Fixing imports...'));
    fixImports(distDir);

    makeExecutable(distDir);
    console.log(
      chalk.green('built'),
      chalk.white.bold('@stringsync/spec'),
      chalk.gray(`in [${stopwatch.ms().toFixed(2)}ms]`),
    );
  } catch (error) {
    console.log(chalk.red('failure'), error);
    process.exit(1);
  }
}

main();
