#!/usr/bin/env node

/**
 * This script fixes import paths in the codebase by updating deep relative imports
 * to use the @orpheus alias paths defined in vite.config.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Convert ESM URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Define the mapping rules
const aliasMapping = [
  {
    pattern: /..\/..\/..\/services\/utils\/(.*)/g,
    replacement: "@orpheus/utils/$1",
  },
  {
    pattern: /..\/..\/..\/components\/widgets\/(.*)/g,
    replacement: "@orpheus/widgets/$1",
  },
  {
    pattern: /..\/..\/..\/contexts\/?(.*)/g,
    replacement: "@orpheus/contexts$1",
  },
  {
    pattern: /..\/..\/..\/types\/(.*)/g,
    replacement: "@orpheus/types/$1",
  },
  {
    pattern: /..\/..\/..\/services\/(.*)/g,
    replacement: "@orpheus/services/$1",
  },
  {
    pattern: /..\/..\/..\/screens\/(.*)/g,
    replacement: "@orpheus/screens/$1",
  },
];

// Helper function to find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith("node_modules") &&
      !file.startsWith(".")
    ) {
      fileList = findTsFiles(filePath, fileList);
    } else if (
      stat.isFile() &&
      (file.endsWith(".ts") || file.endsWith(".tsx")) &&
      !file.endsWith(".d.ts")
    ) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

// Process a file to update imports
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, "utf-8");
  let originalContent = content;

  // Apply each mapping rule
  for (const rule of aliasMapping) {
    content = content.replace(rule.pattern, rule.replacement);
  }

  // Save if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Updated imports in ${filePath}`);
    return true;
  }

  console.log(`No changes needed in ${filePath}`);
  return false;
}

// Main execution
async function main() {
  console.log(`Scanning for TypeScript files...`);
  const srcDir = path.join(rootDir, "src");
  const tsFiles = findTsFiles(srcDir);

  console.log(`Found ${tsFiles.length} TypeScript files to process.`);

  let updatedCount = 0;
  for (const file of tsFiles) {
    if (processFile(file)) {
      updatedCount++;
    }
  }

  console.log(`\nDone! Updated imports in ${updatedCount} files.`);
}

main().catch((err) => {
  console.error("Error processing files:", err);
  process.exit(1);
});
