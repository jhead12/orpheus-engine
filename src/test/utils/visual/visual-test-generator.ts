import { renderTemplate } from '../helpers/template-engine';
import fs from 'fs';
import path from 'path';

export function generateVisualTest({
  componentName,
  componentImportPath,
  testSuiteName,
  props = {},
}: {
  componentName: string;
  componentImportPath: string;
  testSuiteName: string;
  props?: Record<string, unknown>;
}): string {
  return renderTemplate('visual-test.template', {
    ComponentName: componentName,
    ComponentPath: componentImportPath,
    testNamePattern: testSuiteName,
    props,
  });
}
