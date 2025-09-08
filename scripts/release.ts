import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

function runCommand(command: string) {
  console.log(chalk.cyan(`$ ${command}`));
  return execSync(command, { stdio: 'inherit' });
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
  if (execSync('git status --porcelain').toString().trim()) {
    console.error(chalk.red('❌ Commit your changes before publishing.'));
    process.exit(1);
  }

  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
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

      runCommand('bun install'); // Ensure dependencies are locked with the new version
      runCommand('bun run build');
      runCommand(`git commit -am "Release ${nextVersion}"`);
      runCommand(`git tag v${nextVersion}`);
      runCommand(`git push origin v${nextVersion}`);

      // Determine npm tag
      const npmTag = ['alpha', 'beta', 'rc'].includes(type) ? type : 'latest';

      runCommand(`bun publish --access public --tag ${npmTag}`);
      runCommand('git push origin master'); // Push changes to repo

      console.log(chalk.green(`✅ Published ${nextVersion} with tag "${npmTag}".`));
    },
  );
}

main();
