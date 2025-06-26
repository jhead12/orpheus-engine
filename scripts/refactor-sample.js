#!/usr/bin/env node
/**
 * Refactor Sample - Demonstrates how to refactor a file to use path aliases
 * This script demonstrates how to refactor imports in a selected file to use path aliases
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the original file
const testFile = path.join(
  __dirname,
  "../src/screens/workstation/components/__tests__/TrackComponent.test.tsx"
);

// Helper function to transform imports
function transformImports(content) {
  // Define pattern replacements
  const replacements = [
    // Path alias replacements
    {
      from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/test\/(.+?)['"];/g,
      to: "from '@orpheus/test/$1';",
    },
    {
      from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/contexts['"];/g,
      to: "from '@orpheus/contexts';",
    },
    {
      from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\/types\/(.+?)['"];/g,
      to: "from '@orpheus/types/$1';",
    },
    {
      from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/widgets['"];/g,
      to: "from '@orpheus/widgets';",
    },
    {
      from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\/utils\/(.+?)['"];/g,
      to: "from '@orpheus/utils/$1';",
    },

    // If we need to go up one level but we're in the same module area
    { from: /from ['"]\.\.\/(.+?)['"];/g, to: "from '../$1';" }, // Keep these as relative imports
  ];

  // Apply all replacements
  let result = content;
  for (const replacement of replacements) {
    result = result.replace(replacement.from, replacement.to);
  }

  return result;
}

console.log("Refactoring sample file: TrackComponent.test.tsx");

try {
  if (fs.existsSync(testFile)) {
    // Read the file content
    const content = fs.readFileSync(testFile, "utf8");

    // Transform imports
    const transformedContent = transformImports(content);

    // Display the changes (don't actually write them)
    console.log("\nOriginal imports:");
    const originalImports = content.match(/import .+ from ['"].+['"];/g) || [];
    originalImports.forEach((imp) => console.log("  " + imp));

    console.log("\nTransformed imports:");
    const newImports =
      transformedContent.match(/import .+ from ['"].+['"];/g) || [];
    newImports.forEach((imp) => console.log("  " + imp));

    console.log("\nTo apply these changes to all files, run:");
    console.log("  pnpm run refactor:imports");
  } else {
    console.error(
      "Sample file not found. Make sure you run this script from the project root."
    );
  }
} catch (error) {
  console.error("Error processing file:", error);
}
