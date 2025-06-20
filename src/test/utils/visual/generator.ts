import type { VisualTestTemplateData, VisualTestState } from './types';
import { escapeTemplateString, joinLines, indentCode } from './string-utils';

function generateImports(data: VisualTestTemplateData): string {
  const lines = [
    'import { describe, it } from "vitest";',
    'import { render, screen, fireEvent } from "@testing-library/react";',
    'import { expectScreenshot } from "@test/utils/visual/screenshot";'
  ];

  if (data.captureGif) {
    lines.push('import { recordGif } from "@test/utils/visual/gif-recorder";');
  }

  lines.push(`import { ${data.ComponentName} } from "../${data.ComponentPath}";`);
  return joinLines(lines);
}

function generateInteraction(interaction: NonNullable<VisualTestState['interactions']>[number]): string {
  const valueArg = interaction.value ? `, ${JSON.stringify(interaction.value)}` : '';
  return joinLines([
    `// ${interaction.type} interaction`,
    `fireEvent.${interaction.type}(screen.getByTestId('${interaction.target}')${valueArg});`,
    `await new Promise(resolve => setTimeout(resolve, 100)); // Wait for updates`
  ]);
}

function generateInteractions(state: VisualTestState): string {
  if (!state.interactions?.length) {
    return '';
  }

  return indentCode(
    state.interactions.map(generateInteraction).join('\n\n'),
    8
  );
}

function generateCapture(data: VisualTestTemplateData, state: VisualTestState): string {
  const filename = `${data.componentName.toLowerCase()}-${state.name}`;
  
  const lines = data.captureGif 
    ? [
        `// Record a GIF of any animations or state changes`,
        `await recordGif(container, '${filename}', ${data.animationDuration || 2000});`
      ]
    : [
        `// Wait for any animations to complete`,
        `await new Promise(resolve => setTimeout(resolve, 500));`,
        `await expectScreenshot(container, '${filename}.png');`
      ];

  return indentCode(joinLines(lines), 8);
}

function generateTestCase(data: VisualTestTemplateData, state: VisualTestState): string {
  const stateProps = JSON.stringify(state.props || data.props || {}, null, 2);
  const interactions = generateInteractions(state);
  const capture = generateCapture(data, state);
  const containerStyle = escapeTemplateString(data.containerStyle);

  const lines = [
    `it('${state.name} ${data.testNamePattern}', async () => {`,
    `  const container = document.createElement('div');`,
    `  container.style.cssText = \`${containerStyle}\`;`,
    `  document.body.appendChild(container);`,
    ``,
    `  const props = ${stateProps};`,
    `  render(<${data.ComponentName} {...props} data-testid="${data.componentName}" />, { container });`,
    interactions ? `\n${interactions}` : '',
    capture ? `\n${capture}` : '',
    ``,
    `  document.body.removeChild(container);`,
    `});`
  ];

  return indentCode(joinLines(lines), 4);
}

export function generateVisualTest(data: VisualTestTemplateData): string {
  const imports = generateImports(data);
  const testCases = data.states.map(state => generateTestCase(data, state)).join('\n\n');

  const lines = [
    imports,
    '',
    `describe('${data.ComponentName} Visual Tests', () => {`,
    testCases,
    '});',
    ''
  ];

  return joinLines(lines);
}
