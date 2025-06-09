/**
 * Template engine for visual tests
 */

import fs from "fs/promises";
import path from "path";
import { VisualTestConfig } from "../types";

// Simple template engine to replace variables in templates
function renderTemplate(template: string, data: Record<string, any>): string {
  let result = template;

  // Replace {{name}} variables
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();

    if (trimmedKey.startsWith("if ")) {
      // Handle conditional blocks - simple implementation
      const condition = trimmedKey.substring(3);
      return data[condition] ? "" : "{{endif}}";
    } else if (trimmedKey === "endif") {
      return "";
    } else if (trimmedKey === "stringify props") {
      return JSON.stringify(data.props || {}, null, 2);
    } else if (trimmedKey.includes(".")) {
      // Handle nested properties
      const parts = trimmedKey.split(".");
      let value = data;
      for (const part of parts) {
        if (value === undefined) break;
        value = value[part];
      }
      return value !== undefined ? value : match;
    }

    return data[trimmedKey] !== undefined ? data[trimmedKey] : match;
  });

  // Handle each blocks (simplified implementation)
  result = result.replace(
    /\{\{#each ([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (match, collection, template) => {
      const collectionName = collection.trim();
      const items = data[collectionName];

      if (!Array.isArray(items)) {
        return "";
      }

      return items
        .map((item) => {
          // Create a context for this iteration
          const context = { ...data, ...item };
          return renderTemplate(template, context);
        })
        .join("");
    }
  );

  return result;
}

export async function generateTestFromTemplate(
  config: VisualTestConfig,
  outputDir: string
): Promise<string> {
  // Read the template
  const templatePath = path.join(
    process.cwd(),
    "src",
    "test",
    "visual-agent",
    "templates",
    "visual-test.template.ts"
  );
  const template = await fs.readFile(templatePath, "utf-8");

  // Create test data
  const testData = {
    ...config,
    ComponentName: config.componentName,
    ComponentPath: config.componentPath || config.componentName,
    testNamePattern: config.captureGif ? "@visual-gif" : "@visual",
  };

  // Render the template
  const renderedTest = renderTemplate(template, testData);

  // Determine output path
  const outputPath = path.join(
    outputDir,
    `${config.componentName}.visual.test.tsx`
  );

  // Write the test file
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, renderedTest, "utf-8");

  return outputPath;
}

export async function hasExistingTest(
  componentName: string,
  outputDir: string
): Promise<boolean> {
  const outputPath = path.join(outputDir, `${componentName}.visual.test.tsx`);
  try {
    await fs.access(outputPath);
    return true;
  } catch {
    return false;
  }
}
