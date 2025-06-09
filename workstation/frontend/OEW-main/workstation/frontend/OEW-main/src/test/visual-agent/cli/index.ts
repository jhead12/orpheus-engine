/**
 * CLI for the Visual Testing Agent
 */

import fs from "fs/promises";
import path from "path";
import { ComponentConfigs, getAllConfigs, getConfig } from "../configs";
import { generateTestFromTemplate } from "../helpers/template-engine";

/**
 * Main CLI entry point
 */
export async function cli(args: string[]): Promise<void> {
  const command = args[0];
  const componentName = args[1];

  switch (command) {
    case "generate":
      await generateTests(componentName);
      break;
    case "list":
      await listTests();
      break;
    default:
      printHelp();
      break;
  }
}

/**
 * Generate visual tests for components
 */
async function generateTests(componentName?: string): Promise<void> {
  const testsDir = path.join(process.cwd(), "src", "components", "__tests__");
  await fs.mkdir(testsDir, { recursive: true });

  // If a component name is provided, generate test for that component only
  if (componentName) {
    const config = getConfig(componentName);
    if (!config) {
      console.error(`No configuration found for component: ${componentName}`);
      console.log("Available components:");
      console.log(Object.keys(ComponentConfigs).join(", "));
      return;
    }

    const outputPath = await generateTestFromTemplate(config, testsDir);
    console.log(`Generated visual test for ${componentName} at: ${outputPath}`);
    return;
  }

  // Otherwise generate tests for all components
  const configs = getAllConfigs();
  const results = await Promise.all(
    configs.map(async (config) => {
      try {
        const outputPath = await generateTestFromTemplate(config, testsDir);
        return {
          componentName: config.componentName,
          success: true,
          path: outputPath,
        };
      } catch (error) {
        return {
          componentName: config.componentName,
          success: false,
          error: String(error),
        };
      }
    })
  );

  // Print results
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`Generated ${successful.length} visual tests:`);
  successful.forEach((r) => console.log(` - ${r.componentName}: ${r.path}`));

  if (failed.length > 0) {
    console.error(`\nFailed to generate ${failed.length} visual tests:`);
    failed.forEach((r) => console.error(` - ${r.componentName}: ${r.error}`));
  }
}

/**
 * List all visual tests in the project
 */
async function listTests(): Promise<void> {
  // Find all visual test files
  const testDirs = [
    path.join(process.cwd(), "src", "components", "__tests__"),
    // Add more test directories as needed
  ];

  const testFiles: string[] = [];

  for (const dir of testDirs) {
    try {
      const files = await fs.readdir(dir);
      const visualTests = files.filter((file) =>
        file.includes(".visual.test.")
      );
      testFiles.push(...visualTests.map((file) => path.join(dir, file)));
    } catch (error) {
      // Directory might not exist, that's okay
    }
  }

  // Read test files to get the test cases
  const testCases: Record<string, string[]> = {};

  for (const file of testFiles) {
    const content = await fs.readFile(file, "utf-8");
    const componentName = path.basename(file).replace(".visual.test.tsx", "");

    // Extract test names
    const regex = /it\(['"]([^'"]+)['"]/g;
    const tests: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      tests.push(match[1]);
    }

    testCases[componentName] = tests;
  }

  // Print results
  console.log("Visual Tests:");
  for (const [component, tests] of Object.entries(testCases)) {
    console.log(`\n${component}:`);
    for (const test of tests) {
      console.log(` - ${test}`);
    }
  }

  console.log(
    `\nTotal: ${testFiles.length} components, ${
      Object.values(testCases).flat().length
    } test cases`
  );
}

/**
 * Print help information
 */
function printHelp(): void {
  console.log("Visual Testing Agent");
  console.log("\nCommands:");
  console.log(
    "  generate [component]  Generate visual tests for all components or a specific component"
  );
  console.log("  list                  List all visual tests in the project");
}
