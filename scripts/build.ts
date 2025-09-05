#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Building @stringsync/spec...');

// Clean dist directory
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(distDir, { recursive: true });

// Build with TypeScript compiler
try {
  console.log('Compiling TypeScript...');
  execSync(
    'npx tsc --outDir dist --rootDir . --module ESNext --target ES2022 --moduleResolution bundler --allowSyntheticDefaultImports --esModuleInterop --skipLibCheck --declaration false --sourceMap false --noEmit false --verbatimModuleSyntax false --allowImportingTsExtensions false',
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    },
  );
} catch (error) {
  console.error('TypeScript compilation failed:', (error as Error).message);
  process.exit(1);
}

// Fix imports in the compiled files
const fixImports = (dir: string): void => {
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
        const relativePath = path.relative(path.dirname(filePath), path.join(distDir, importPath));
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
};

console.log('Fixing imports...');
fixImports(distDir);

// Copy built files to root level for distribution
const rootDir = path.join(__dirname, '..');
const copyBuiltFiles = (srcDir: string, destDir: string, relativePath = ''): void => {
  const files = fs.readdirSync(srcDir);

  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, relativePath, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // Skip the scripts directory
      if (file === 'scripts') {
        return;
      }
      // Create directory in destination
      fs.mkdirSync(destPath, { recursive: true });
      copyBuiltFiles(srcPath, destDir, path.join(relativePath, file));
    } else if (file.endsWith('.js')) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied ${path.join(relativePath, file)}`);
    }
  }
};

// Copy all built files to root
copyBuiltFiles(distDir, rootDir);

// Make the main entry point executable
const mainFile = path.join(rootDir, 'index.js');
if (fs.existsSync(mainFile)) {
  // Read the file content
  let content = fs.readFileSync(mainFile, 'utf8');

  // Replace the bun shebang with node shebang for broader compatibility
  content = content.replace('#!/usr/bin/env bun', '#!/usr/bin/env node');

  // Write back the modified content
  fs.writeFileSync(mainFile, content);

  // Make it executable
  fs.chmodSync(mainFile, '755');

  console.log('✓ Built successfully');
  console.log(`✓ Entry point: ${mainFile}`);
} else {
  console.error('Error: Main entry point not found after build');
  process.exit(1);
}

// Clean up dist directory
fs.rmSync(distDir, { recursive: true, force: true });

console.log('Build complete!');
