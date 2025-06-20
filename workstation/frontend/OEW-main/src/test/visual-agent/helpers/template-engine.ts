/**
 * Template engine for visual tests
 */

import fs from "fs/promises";
import path from "path";
import { VisualTestConfig } from "../types";

interface TemplateData extends VisualTestConfig {
  ComponentName: string;
  ComponentPath: string;
  testNamePattern: string;
}

// Simple template engine to replace variables in templates
function renderTemplate(template: string, data: TemplateData): string {
  let result = template;

  // Replace {{name}} variables
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();

    if (trimmedKey.startsWith("if ")) {
      // Handle conditional blocks - simple implementation
      const condition = trimmedKey.substring(3);
      return data[condition as keyof TemplateData] ? "" : "{{endif}}";
    } else if (trimmedKey === "endif") {
      return "";
    } else if (trimmedKey === "stringify props") {
      return JSON.stringify(data.props || {}, null, 2);
    } else if (trimmedKey.includes(".")) {
      // Handle nested properties
      const parts = trimmedKey.split(".");
      let value: unknown = data;
      for (const part of parts) {
        if (value === undefined) break;
        value = (value as Record<string, unknown>)[part];
      }
      return value !== undefined ? String(value) : match;
    }

    return data[trimmedKey as keyof TemplateData] !== undefined 
      ? String(data[trimmedKey as keyof TemplateData]) 
      : match;
  });

  // Handle each blocks (simplified implementation)
  result = result.replace(
    /\{\{#each ([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_fullMatch, collection, blockTemplate) => {
      const collectionName = collection.trim() as keyof TemplateData;
      const items = data[collectionName];

      if (!Array.isArray(items)) {
        return "";
      }

      return items
        .map((item) => {
          // Create a context for this iteration
          const context = { ...data, ...item };
          return renderTemplate(blockTemplate, context);
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
    "visual-test.template.hbs"
  );
  const template = await fs.readFile(templatePath, "utf-8");

  // Create test data
  const testData: TemplateData = {
    ...config,
    ComponentName: config.componentName,
    ComponentPath: config.importPath,
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
