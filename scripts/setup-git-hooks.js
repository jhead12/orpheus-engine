#!/usr/bin/env node

/**
 * Git Hooks Setup Script
 *
 * This script sets up git hooks for the Orpheus Engine project
 * to ensure code quality and consistency.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const log = {
  info: (msg) => console.log(chalk.blue(`ℹ️ ${msg}`)),
  success: (msg) => console.log(chalk.green(`✅ ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠️ ${msg}`)),
  error: (msg) => console.log(chalk.red(`❌ ${msg}`)),
  title: (msg) => console.log(chalk.bold.cyan(`\n${msg}`)),
};

function setupGitHooks() {
  log.title('🔗 Setting up Git Hooks');

  try {
    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch (error) {
    log.error('Not in a git repository. Please run "git init" first.');
    process.exit(1);
  }

  const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
  const projectHooksDir = path.join(process.cwd(), '.githooks');

  // Ensure .git/hooks directory exists
  if (!fs.existsSync(gitHooksDir)) {
    fs.mkdirSync(gitHooksDir, { recursive: true });
    log.success('Created .git/hooks directory');
  }

  // Check if project hooks directory exists
  if (!fs.existsSync(projectHooksDir)) {
    log.warning('Project hooks directory not found. No hooks to install.');
    return;
  }

  // Copy hooks from .githooks to .git/hooks
  const hookFiles = fs.readdirSync(projectHooksDir);

  hookFiles.forEach((hookFile) => {
    const sourcePath = path.join(projectHooksDir, hookFile);
    const targetPath = path.join(gitHooksDir, hookFile);

    try {
      fs.copyFileSync(sourcePath, targetPath);
      fs.chmodSync(targetPath, 0o755); // Make executable
      log.success(`Installed ${hookFile} hook`);
    } catch (error) {
      log.error(`Failed to install ${hookFile} hook: ${error.message}`);
    }
  });

  log.success('Git hooks setup completed!');
  log.info('The following hooks will now run automatically:');
  log.info('• pre-commit: Code formatting and linting before commits');

  log.title('💡 Usage Tips');
  log.info('• To skip hooks temporarily: git commit --no-verify');
  log.info('• To run quality checks manually: npm run quality:check');
  log.info('• To fix code issues: npm run quality:fix');
}

function main() {
  log.title('🚀 Orpheus Engine - Git Hooks Setup');

  setupGitHooks();

  log.info('\nHappy coding with automated quality checks! 🎉');
}

// Run the setup
main();
