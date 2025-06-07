#!/usr/bin/env node
/**
 * Refactor Imports - Refactors deep relative imports to use path aliases
 *
 * This script automatically updates import paths in your codebase
 * from deep relative paths (e.g., '../../../services/types/types')
 * to cleaner path aliases (e.g., '@orpheus/types/types')
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Setup readline interface for interactive prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask yes/no questions
async function askYesNo(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n) `, (answer) => {
      resolve(
        answer.trim().toLowerCase() === "y" ||
          answer.trim().toLowerCase() === "yes"
      );
    });
  });
}

// Mapping of deep relative paths to aliases
const pathAliasMap = [
  // Core module paths
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/contexts['"]/g,
    replacement: "from '@orpheus/contexts'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/contexts\/(.+?)['"]/g,
    replacement: "from '@orpheus/contexts/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\/types\/(.+?)['"]/g,
    replacement: "from '@orpheus/types/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\/utils\/(.+?)['"]/g,
    replacement: "from '@orpheus/utils/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/widgets['"]/g,
    replacement: "from '@orpheus/widgets'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/widgets\/(.+?)['"]/g,
    replacement: "from '@orpheus/widgets/$1'",
  },

  // Test paths
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/test\/(.+?)['"]/g,
    replacement: "from '@orpheus/test/$1'",
  },

  // Screens paths
  {
    pattern:
      /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/screens\/workstation\/(.+?)['"]/g,
    replacement: "from '@orpheus/workstation/$1'",
  },

  // Three levels deep
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/services\/types\/(.+?)['"]/g,
    replacement: "from '@orpheus/types/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/services\/utils\/(.+?)['"]/g,
    replacement: "from '@orpheus/utils/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/components\/widgets['"]/g,
    replacement: "from '@orpheus/widgets'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/components\/widgets\/(.+?)['"]/g,
    replacement: "from '@orpheus/widgets/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/contexts['"]/g,
    replacement: "from '@orpheus/contexts'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/contexts\/(.+?)['"]/g,
    replacement: "from '@orpheus/contexts/$1'",
  },

  // Two levels deep
  {
    pattern: /from ['"]\.\.\/\.\.\/services\/types\/(.+?)['"]/g,
    replacement: "from '@orpheus/types/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/services\/utils\/(.+?)['"]/g,
    replacement: "from '@orpheus/utils/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/components\/widgets['"]/g,
    replacement: "from '@orpheus/widgets'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/components\/widgets\/(.+?)['"]/g,
    replacement: "from '@orpheus/widgets/$1'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/contexts['"]/g,
    replacement: "from '@orpheus/contexts'",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/contexts\/(.+?)['"]/g,
    replacement: "from '@orpheus/contexts/$1'",
  },

  // Import type statements
  {
    pattern:
      /import type \{ (.+?) \} from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\/types\/(.+?)['"]/g,
    replacement: "import type { $1 } from '@orpheus/types/$2'",
  },
  {
    pattern:
      /import type \{ (.+?) \} from ['"]\.\.\/\.\.\/\.\.\/services\/types\/(.+?)['"]/g,
    replacement: "import type { $1 } from '@orpheus/types/$2'",
  },
  {
    pattern:
      /import type \{ (.+?) \} from ['"]\.\.\/\.\.\/services\/types\/(.+?)['"]/g,
    replacement: "import type { $1 } from '@orpheus/types/$2'",
  },
];

// Find files with deep imports
async function findFilesWithDeepImports() {
  console.log("Scanning for files with deep relative imports...");

  const filesToProcess = [];
  const extensions = [".ts", ".tsx", ".js", ".jsx"];

  // Directories to check
  const dirsToCheck = [
    path.join(rootDir, "src/components"),
    path.join(rootDir, "src/screens"),
    path.join(rootDir, "src/services"),
    path.join(rootDir, "src/test"),
    path.join(rootDir, "src/contexts"),
  ];

  // Recursively find all files
  for (const dir of dirsToCheck) {
    await findFilesInDir(dir, filesToProcess, extensions);
  }

  return filesToProcess;
}

// Helper to recursively scan directories
async function findFilesInDir(dir, results, extensions, depth = 0) {
  if (depth > 10) return; // Prevent infinite recursion

  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other special directories
      if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
        await findFilesInDir(fullPath, results, extensions, depth + 1);
      }
    } else if (extensions.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(fullPath, "utf8");

      // Check for deep relative imports
      const hasDeepRelativeImport =
        content.includes("../../../") || content.includes("../../../../");

      if (hasDeepRelativeImport) {
        results.push({
          path: fullPath,
          relativePath: path.relative(rootDir, fullPath),
        });
      }
    }
  }
}

// Process a single file
async function processFile(filePath) {
  console.log(`Processing ${filePath}...`);

  let content = fs.readFileSync(filePath, "utf8");
  let originalContent = content;
  let hasChanges = false;

  // Apply each pattern replacement
  for (const { pattern, replacement } of pathAliasMap) {
    content = content.replace(pattern, replacement);
  }

  // Check if content changed
  hasChanges = content !== originalContent;

  if (hasChanges) {
    // Show a diff of what changed
    console.log("\nChanges detected:");
    const originalImports =
      originalContent.match(/import .+ from ['"].+['"];/g) || [];
    const newImports = content.match(/import .+ from ['"].+['"];/g) || [];

    // Find imports that changed
    const changedImports = newImports.filter(
      (imp, i) => originalImports[i] !== imp
    );

    // Show the changes
    changedImports.forEach((imp, i) => {
      const originalIndex = newImports.indexOf(imp);
      if (originalIndex >= 0 && originalIndex < originalImports.length) {
        console.log(`  - ${originalImports[originalIndex]}`);
        console.log(`  + ${imp}`);
      }
    });

    // Ask for confirmation to save changes
    const doSave = await askYesNo("Save these changes?");

    if (doSave) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log("Changes saved.");
      return true;
    } else {
      console.log("Changes discarded.");
      return false;
    }
  } else {
    console.log("No changes needed.");
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log("🔍 Finding files with deep imports...");
    const files = await findFilesWithDeepImports();

    if (files.length === 0) {
      console.log("No files found with deep imports. All good!");
      rl.close();
      return;
    }

    console.log(`\nFound ${files.length} files with deep imports:`);
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.relativePath}`);
    });

    const processAll = await askYesNo("\nDo you want to process all files?");

    let changedFiles = 0;

    if (processAll) {
      for (const file of files) {
        const changed = await processFile(file.path);
        if (changed) changedFiles++;
        console.log("-".repeat(80));
      }
    } else {
      for (const file of files) {
        const shouldProcess = await askYesNo(`Process ${file.relativePath}?`);
        if (shouldProcess) {
          const changed = await processFile(file.path);
          if (changed) changedFiles++;
          console.log("-".repeat(80));
        }
      }
    }

    console.log(
      `\n✅ Refactoring complete! Changed ${changedFiles} of ${files.length} files.`
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    rl.close();
  }
}

// Run the script
main();
