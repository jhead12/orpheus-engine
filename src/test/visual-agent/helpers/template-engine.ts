/**
 * Template engine for visual tests
 */

import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { VisualTestConfig } from "../types";

interface TemplateData extends VisualTestConfig {
  ComponentName: string;
  ComponentPath: string;
  testNamePattern: string;
}

// Render template using Handlebars
export function renderTemplate(templateName: string, data: TemplateData): string {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);
  return template(data);
}

export async function generateTestFromTemplate(
  config: VisualTestConfig,
  outputDir: string
): Promise<string> {
  // Create test data
  const testData: TemplateData = {
    ...config,
    ComponentName: config.componentName,
    ComponentPath: config.importPath,
    testNamePattern: config.captureGif ? "@visual-gif" : "@visual",
  };

  // Render the template
  const renderedTest = renderTemplate("visual-test", testData);

  // Determine output path
  const outputPath = path.join(
    outputDir,
    `${config.componentName}.visual.test.tsx`
  );

  // Write the test file
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, renderedTest, "utf-8");

  return outputPath;
}

export async function hasExistingTest(
  componentName: string,
  outputDir: string
): Promise<boolean> {
  const outputPath = path.join(outputDir, `${componentName}.visual.test.tsx`);
  try {
    await fs.promises.access(outputPath);
    return true;
  } catch {
    return false;
  }
}
