import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';

const PACKAGE_JSON_PATH = path.resolve(__dirname, '..', 'package.json');

function run(command: string) {
  console.log(chalk.cyan(`$ ${command}`));
  const output = execSync(command).toString().trim();
  console.log(chalk.gray(output));
  return output;
}

function getCurrentVersion() {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  return pkg.version;
}

function updateVersion(version: string) {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  pkg.version = version;
  writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n');
}

function getNextVersion(type: string, currentVersion: string) {
  const [major, minor, patch, revision] = currentVersion.split('.').map(Number);

  switch (type) {
    case 'alpha':
      return `${major}.${minor}.${patch}-alpha.${revision + 1}`;
    case 'beta':
      return `${major}.${minor}.${patch}-beta.${revision + 1}`;
    case 'rc':
      return `${major}.${minor}.${patch}-rc.${revision + 1}`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      throw new Error(`Invalid version type: ${type}`);
  }
}

function main() {
  if (!run('which bun')) {
    console.error(chalk.red('❌ Bun is not installed or not found in PATH.'));
    process.exit(1);
  }

  if (!run('which git')) {
    console.error(chalk.red('❌ Git is not installed or not found in PATH.'));
    process.exit(1);
  }

  if (!run('which gh')) {
    console.error(chalk.red('❌ GitHub CLI (gh) is not installed or not found in PATH.'));
    process.exit(1);
  }

  try {
    run('gh auth status');
  } catch (e) {
    console.error(chalk.red('❌ You must be logged in to GitHub CLI (gh).', e));
    process.exit(1);
  }

  if (run('git status --porcelain')) {
    console.error(chalk.red('❌ Commit your changes before publishing.'));
    process.exit(1);
  }

  const currentBranch = run('git rev-parse --abbrev-ref HEAD');
  if (currentBranch !== 'master') {
    console.error(chalk.red('❌ You must be on the master branch to publish.'));
    process.exit(1);
  }

  const type = process.argv[2]; // Get version type from CLI args
  if (!type) {
    console.error(
      chalk.red('❌ Please specify a version type (alpha, beta, rc, patch, minor, major)'),
    );
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  const nextVersion = getNextVersion(type, currentVersion);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    chalk.yellow(
      `current: ${currentVersion}, next: ${nextVersion} (${type}). Are you sure? (y/n) `,
    ),
    (answer) => {
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log(chalk.red('❌ Aborted.'));
        process.exit(0);
      }

      console.log(chalk.green(`🚀 Publishing version ${nextVersion}...`));
      updateVersion(nextVersion);

      run('bun install'); // Ensure dependencies are locked with the new version
      run('bun run build');
      run(`git commit -am "Release ${nextVersion}"`);
      run(`git tag v${nextVersion}`);
      run(`git push origin v${nextVersion}`);

      // Determine npm tag
      const npmTag = ['alpha', 'beta', 'rc'].includes(type) ? type : 'latest';

      run(`bun publish --access public --tag ${npmTag}`);
      run('git push origin master');
      run(`gh release create v${nextVersion} --generate-notes`);

      console.log(chalk.green(`✅ Published ${nextVersion} with tag "${npmTag}".`));
    },
  );
}

main();
