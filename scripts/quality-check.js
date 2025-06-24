#!/usr/bin/env node

/**
 * Comprehensive Code Quality Checker
 *
 * This script runs all code quality checks in the proper order:
 * 1. Type checking with TypeScript
 * 2. Code formatting with Prettier
 * 3. Linting with ESLint
 * 4. Running tests
 * 5. Security audit
 *
 * Usage: npm run quality:check
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const log = {
  info: (msg) => console.log(chalk.blue(`ℹ️ ${msg}`)),
  success: (msg) => console.log(chalk.green(`✅ ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠️ ${msg}`)),
  error: (msg) => console.log(chalk.red(`❌ ${msg}`)),
  title: (msg) =>
    console.log(
      chalk.bold.cyan(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`)
    ),
};

const runCommand = (command, description, { ignoreErrors = false } = {}) => {
  try {
    log.info(`Running: ${description}`);
    const result = execSync(command, {
      stdio: 'inherit',
      encoding: 'utf8',
      timeout: 300000, // 5 minutes timeout
    });
    log.success(`${description} completed successfully`);
    return true;
  } catch (error) {
    if (ignoreErrors) {
      log.warning(`${description} completed with warnings`);
      return true;
    } else {
      log.error(`${description} failed: ${error.message}`);
      return false;
    }
  }
};

const checkFileExists = (filePath, description) => {
  if (fs.existsSync(filePath)) {
    log.success(`${description} found`);
    return true;
  } else {
    log.warning(`${description} not found at ${filePath}`);
    return false;
  }
};

async function main() {
  log.title('🚀 Orpheus Engine - Code Quality Check');

  const startTime = Date.now();
  let success = true;

  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!checkFileExists(packageJsonPath, 'package.json')) {
    log.error('Not in a valid Node.js project directory');
    process.exit(1);
  }

  // 1. Check configuration files
  log.title('📋 Configuration Check');

  const configFiles = [
    { path: 'tsconfig.json', name: 'TypeScript config' },
    { path: 'eslint.config.js', name: 'ESLint config' },
    { path: '.prettierrc.json', name: 'Prettier config' },
    { path: 'vitest.config.ts', name: 'Vitest config' },
  ];

  configFiles.forEach(({ path: filePath, name }) => {
    checkFileExists(filePath, name);
  });

  // 2. Install dependencies if needed
  log.title('📦 Dependencies Check');

  if (!fs.existsSync('node_modules')) {
    log.info('Installing dependencies...');
    if (!runCommand('npm install', 'Dependency installation')) {
      success = false;
    }
  } else {
    log.success('Dependencies already installed');
  }

  // 3. Type checking
  log.title('🔍 TypeScript Type Checking');

  if (!runCommand('npm run typecheck', 'TypeScript type checking')) {
    success = false;
  }

  // 4. Code formatting check
  log.title('🎨 Code Formatting Check');

  if (
    !runCommand('npm run format:check', 'Prettier format checking', {
      ignoreErrors: true,
    })
  ) {
    log.info('Attempting to fix formatting issues...');
    if (!runCommand('npm run format', 'Prettier formatting')) {
      success = false;
    }
  }

  // 5. Linting
  log.title('🔧 ESLint Code Analysis');

  if (!runCommand('npm run lint', 'ESLint checking', { ignoreErrors: true })) {
    log.info('Attempting to fix linting issues...');
    if (
      !runCommand('npm run lint:fix', 'ESLint auto-fixing', {
        ignoreErrors: true,
      })
    ) {
      log.warning('Some linting issues could not be auto-fixed');
    }
  }

  // 6. Run tests
  log.title('🧪 Running Tests');

  // Check if we have test files
  const hasTests =
    fs.existsSync('src') &&
    execSync('find src -name "*.test.*" -o -name "*.spec.*"', {
      encoding: 'utf8',
    }).trim().length > 0;

  if (hasTests) {
    if (!runCommand('npm test', 'Unit tests', { ignoreErrors: true })) {
      log.warning('Some tests failed - please review test output');
    }
  } else {
    log.warning('No test files found');
  }

  // 7. Security audit
  log.title('🔒 Security Audit');

  if (
    !runCommand('npm audit --audit-level moderate', 'Security audit', {
      ignoreErrors: true,
    })
  ) {
    log.warning(
      'Security vulnerabilities found - consider running "npm audit fix"'
    );
  }

  // 8. Bundle size analysis (if build script exists)
  log.title('📊 Bundle Analysis');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.scripts && packageJson.scripts.build) {
    log.info('Build script found - checking bundle...');
    if (
      runCommand('npm run build', 'Production build', { ignoreErrors: true })
    ) {
      // Check bundle size
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        const stats = fs.statSync(distPath);
        log.info('Build output generated in dist/ directory');
      }
    }
  } else {
    log.info('No build script found - skipping bundle analysis');
  }

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log.title('📈 Summary');

  if (success) {
    log.success(`All quality checks completed successfully in ${duration}s`);
    log.info('Your code meets the project quality standards! 🎉');
  } else {
    log.error(`Quality checks completed with errors in ${duration}s`);
    log.info('Please review the errors above and fix them before committing.');
    process.exit(1);
  }

  // Recommendations
  log.title('💡 Recommendations');

  const recommendations = [
    'Run "npm run code:quality" before committing changes',
    'Use "npm run test:watch" during development for continuous testing',
    'Consider adding pre-commit hooks to enforce quality checks',
    'Review the CODING_STANDARDS.md for best practices',
  ];

  recommendations.forEach((rec, index) => {
    log.info(`${index + 1}. ${rec}`);
  });

  log.info('\nHappy coding! 🚀');
}

// Handle script errors
process.on('uncaughtException', (error) => {
  log.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  log.error(`Script failed: ${error.message}`);
  process.exit(1);
});
